from fastapi import FastAPI, File, UploadFile
import onnxruntime as ort
import numpy as np
from PIL import Image
from io import BytesIO
from fastapi.middleware.cors import CORSMiddleware
import base64  # Base64 변환 추가

app = FastAPI()

# CORS 설정 (프론트엔드와 연동을 위해 필요)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 도메인 허용 (보안상 필요하면 특정 도메인만 허용)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ ONNX 모델 로드 및 최적화 설정
onnx_model_path = "draw_classify_model1.onnx"  # 변환된 ONNX 모델 경로
sess_options = ort.SessionOptions()
sess_options.intra_op_num_threads = 2  # CPU 연산 최적화
sess_options.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL  # 순차 실행
sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL  # 그래프 최적화 활성화

ort_session = ort.InferenceSession(onnx_model_path, sess_options)

# ✅ 클래스 라벨 리스트
class_labels = ['ant', 'apple', 'axe', 'backpack', 'banana', 
                'barn', 'basket', 'bear', 'bed', 'bee', 
                'bench', 'bread', 'bridge', 'broccoli', 'broom', 
                'bucket', 'bush', 'butterfly', 'carrot', 'cat', 
                'chair', 'cloud', 'cow', 'cup', 'dog', 
                'donut', 'door', 'duck', 'feather', 'fence']

# ✅ 이미지 전처리 함수 (ONNX 모델 입력 형식에 맞게 변환)
def transform_image(image_bytes):
    image = Image.open(BytesIO(image_bytes)).convert("RGB")  # RGB 변환
    print(f"Original Image Size: {image.size}")  # 디버깅용 출력

    image = image.resize((64, 64))  # ONNX 모델 입력 크기에 맞게 조정
    image = image.convert("L")  # 흑백 변환 (Grayscale)
    
    image_array = np.array(image, dtype=np.float32) / 255.0  # 0~1 정규화
    image_array = (image_array - 0.5) / 0.5  # -1~1 정규화
    image_array = np.expand_dims(image_array, axis=(0, 1))  # (1, 1, 64, 64) 형태로 변환 (배치 차원 포함)

    print(f"Transformed Image Shape: {image_array.shape}")  # 디버깅용 출력
    return image_array

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image_array = transform_image(image_bytes)  # ✅ numpy array 반환

    # ✅ ONNX 모델 실행
    inputs = {ort_session.get_inputs()[0].name: image_array}
    outputs = ort_session.run(None, inputs)
    
    probabilities = np.exp(outputs[0]) / np.sum(np.exp(outputs[0]))  # 소프트맥스 적용
    top_indices = np.argsort(probabilities[0])[::-1][:10]  # 상위 10개 인덱스

    top_predictions = [
        {"class": class_labels[idx], "probability": float(probabilities[0][idx])}
        for idx in top_indices
    ]

    # ✅ 이미지를 Base64로 변환해 클라이언트에서 표시할 수 있도록 함
    image_base64 = base64.b64encode(image_bytes).decode()

    return {
        "predictions": top_predictions,
        "image": f"data:image/png;base64,{image_base64}"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)