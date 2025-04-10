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
from fastapi import Form

from fastapi.middleware.cors import CORSMiddleware
import logging
from fastapi import HTTPException

origins = [
    "https://www.drawaing.site",
    "http://localhost:5173",
]

# 로그 설정
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

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
class_labels = ['비행기', '개미', '사과', '도끼', '바나나', '헛간', '바구니', '박쥐', '곰', '침대', 
                '벌', '새', '빵', '브로콜리', '빗자루', '양동이', '덤불', '나비', '선인장', '양초', '당근', '고양이', 
                '의자', '시계', '구름', '소', '컵', '강아지', '문', '오리', '안경', '선풍기', '깃털', 
                '울타리', '물고기', '꽃', '개구리', '기타', '포도', '수풀', '망치', '고슴도치', '말', 
                '집', '열쇠', '사다리', '잎사귀', '전구', '달', '모기', '산', '쥐', '버섯', 
                '양파', '땅콩', '배', '완두콩', '연필', '돼지', '파인애플', '감자', '토끼', '너구리', 
                '비', '무지개', '갈퀴', '강', '샌드위치', '톱', '양', '삽', '달팽이', '뱀', 
                '눈송이', '눈사람', '축구공', '거미', '별', '딸기', '태양', '백조', '탁자', '텐트', '트랙터', '나무', 
                '트럭', '우산', '수박', '고래', '풍차']

kor_labels = []

# 이미지 변환 함수
def transform_image(image_bytes, save_transformed_image=True):
    image = Image.open(BytesIO(image_bytes)).convert('RGB')  # RGBA나 RGB 이미지를 먼저 불러온 후
    #print(f"Original Image Size: {image.size}")  # 이미지 크기 확인

    transform = transforms.Compose([
        transforms.Resize((112, 112)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])  # 새로운 평균값과 표준편차
    ])

    image_tensor = transform(image).unsqueeze(0)
    print(f"Transformed Image Tensor Shape: {image_tensor.shape}")  # 변환된 텐서 크기 확인

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
async def predict(file: UploadFile = File(...), quizWord: str = Form(...)):
    try:
        # 파일 읽기
        image_bytes = await file.read()
        logger.debug(f"Received file: {file.filename}, size: {len(image_bytes)}")
        
        file.seek(0)  # Reset file position after reading
        logger.debug(f"Received quizWord: {quizWord}")

        # 이미지 변환
        image_tensor = transform_image(image_bytes, save_transformed_image=True).to(device)

        with torch.no_grad():
            outputs = model(image_tensor)
            logger.debug(f"Raw outputs: {outputs}")
            
            probabilities = torch.nn.functional.softmax(outputs, dim=1)  # 확률 변환
            top_probs, top_indices = torch.topk(probabilities, 5, dim=1)  # 상위 5개 예측

        # 예측 결과 처리
        top_predictions = [
            {"class": class_labels[idx.item()], "probability": round(prob.item(), 4)}
            for idx, prob in zip(top_indices[0], top_probs[0])
        ]
        logger.debug(f"Top predictions: {top_predictions}")

        # quizWord와 비교하여 결과 결정
        result = ""
        correct = False
        logger.debug(f"초기 : {result} / {correct}")
        
        for prediction in top_predictions:
            if prediction["class"] == quizWord:
                result = quizWord
                correct = True
                break

        if not correct:
            # quizWord와 일치하지 않으면 가장 확률이 높은 예측을 result로 설정
            result = top_predictions[0]["class"]
            correct = False
        
        logger.debug(f"확인 : {result} / {correct}")

        # 결과 반환
        return {
            "result": result,
            "correct": correct
        }
    except Exception as e:
        # 예외 처리
        logger.error(f"Error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)