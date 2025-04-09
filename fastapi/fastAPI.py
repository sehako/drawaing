from fastapi import FastAPI, File, UploadFile
import torch
import torchvision.transforms as transforms
import torchvision.models as models
from PIL import Image
from io import BytesIO
from model.modeling import ModifiedMnasNet  # 모델 클래스 임포트. 필요하다니 불러옴...
from fastapi.middleware.cors import CORSMiddleware
import base64  # 추가
import os

from fastapi.middleware.cors import CORSMiddleware

origins = [
    "https://www.drawaing.site",
    "http://localhost:5173",
]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# GPU가 있다면 GPU 사용, 없다면 CPU 사용
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 모델 로드 (사전에 학습된 CNN 모델)
model = ModifiedMnasNet(num_classes=90)  # 클래스 수를 맞춰서 초기화
model.load_state_dict(torch.load("mnasnet10_112__79.pth", map_location=device))
model.to(device)  # 모델을 GPU 또는 CPU로 이동
model.eval()

# 클래스 라벨 리스트 (실제 학습 데이터에 맞게 수정)
class_labels = ['airplane', 'ant', 'apple', 'axe', 'banana', 'barn', 'basket', 'bat', 'bear', 'bed', 
                'bee', 'bird', 'bread', 'broccoli', 'broom', 'bucket', 'bush', 'butterfly', 'cactus', 'candle', 'carrot', 'cat', 
                'chair', 'clock', 'cloud', 'cow', 'cup', 'dog', 'door', 'duck', 'eyeglasses', 'fan', 'feather', 
                'fence', 'fish', 'flower', 'frog', 'guitar', 'grapes', 'grass', 'hammer', 'hedgehog', 'horse', 
                'house', 'key', 'ladder', 'leaf', 'light bulb', 'moon', 'mosquito', 'mountain', 'mouse', 'mushroom', 
                'onion', 'peanut', 'pear', 'peas', 'pencil', 'pig', 'pineapple', 'potato', 'rabbit', 'raccoon', 
                'rain', 'rainbow', 'rake', 'river', 'sandwich', 'saw', 'sheep', 'shovel', 'snail', 'snake', 
                'snowflake', 'snowman', 'soccer ball', 'spider', 'star', 'strawberry', 'sun', 'swan', 'table', 'tent', 'tractor', 'tree', 
                'truck', 'umbrella', 'watermelon', 'whale', 'windmill']

# 이미지 변환 함수
def transform_image(image_bytes, save_transformed_image=True):
    image = Image.open(BytesIO(image_bytes)).convert('RGB')  # RGBA나 RGB 이미지를 먼저 불러온 후
    #print(f"Original Image Size: {image.size}")  # 이미지 크기 확인

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])  # 새로운 평균값과 표준편차
    ])

    image_tensor = transform(image).unsqueeze(0)
    #print(f"Transformed Image Tensor Shape: {image_tensor.shape}")  # 변환된 텐서 크기 확인

    #if save_transformed_image:
    #    # 텐서를 PIL 이미지로 변환하여 저장
    #    transformed_image = transforms.ToPILImage()(image_tensor.squeeze(0))
    #    transformed_image.save("transformed_image.png")
    #    print("Transformed image saved as 'transformed_image.png'")

    return image_tensor

# 이미지 저장 함수
def save_image(image_bytes, filename="image.png"):
    # 파일 경로 설정
    save_path = os.path.join("saved_images", filename)
    os.makedirs(os.path.dirname(save_path), exist_ok=True)  # 저장할 디렉토리 없으면 생성
    with open(save_path, "wb") as f:
        f.write(image_bytes)
    print(f"Image saved at {save_path}")

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()
    
    # 이미지를 서버에 저장
    # save_image(image_bytes, filename="image.png")
    
    # 이미지 변환
    image_tensor = transform_image(image_bytes, save_transformed_image=True).to(device)

    with torch.no_grad():
        outputs = model(image_tensor)
        print("Raw outputs:", outputs)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)  # 확률 변환
        top_probs, top_indices = torch.topk(probabilities, 5, dim=1)  # 상위 5개 예측

    # 예측 결과
    top_predictions = [
        {"class": class_labels[idx.item()], "probability": round(prob.item(), 4)}
        for idx, prob in zip(top_indices[0], top_probs[0])
    ]

    # quizWord와 비교하여 결과 결정
    result = None
    correct = False

    # quizWord가 예측 목록에 있는지 확인
    for prediction in top_predictions:
        if prediction["class"] == quizWord:
            result = quizWord
            correct = True
            break

    if not correct:
        # quizWord와 일치하지 않으면 가장 확률이 높은 예측을 result로 설정
        result = top_predictions[0]["class"]
        correct = False

    # 결과 반환
    return {
        "result": result,
        "correct": correct
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)