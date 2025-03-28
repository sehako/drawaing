import torch
import torch.nn as nn
import torch.nn.functional as F
import onnx

# 모델 구조 정의 (주어진 코드 그대로 사용)
class DrawAingCNN(nn.Module):
    def __init__(self, num_classes):
        super(DrawAingCNN, self).__init__()

        # 1번 은닉층
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(32)
        self.conv1_2 = nn.Conv2d(32, 32, kernel_size=3, padding=1)
        self.bn1_2 = nn.BatchNorm2d(32)
        self.pool1 = nn.MaxPool2d(kernel_size=2)
        self.dropout1 = nn.Dropout(0.1)

        # 2번 은닉층
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(64)
        self.conv2_2 = nn.Conv2d(64, 64, kernel_size=3, padding=1)
        self.bn2_2 = nn.BatchNorm2d(64)
        self.pool2 = nn.MaxPool2d(kernel_size=2)
        self.dropout2 = nn.Dropout(0.1)

        # 3번 은닉층
        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        self.bn3 = nn.BatchNorm2d(128)
        self.conv3_2 = nn.Conv2d(128, 128, kernel_size=3, padding=1)
        self.bn3_2 = nn.BatchNorm2d(128)
        self.pool3 = nn.MaxPool2d(kernel_size=2)
        self.dropout3 = nn.Dropout(0.1)

        # Fully connected layers
        self.fc1 = nn.Linear(128 * 8 * 8, 512) 
        self.bn_fc = nn.BatchNorm1d(512)
        self.dropout_fc = nn.Dropout(0.3)
        self.fc2 = nn.Linear(512, num_classes)

    def forward(self, x):
        # 1번 
        x = F.leaky_relu(self.bn1(self.conv1(x)), negative_slope=0.1)
        x = F.relu(self.bn1_2(self.conv1_2(x)))
        x = self.pool1(x)
        x = self.dropout1(x)

        # 2번
        x = F.leaky_relu(self.bn2(self.conv2(x)), negative_slope=0.1)
        x = F.relu(self.bn2_2(self.conv2_2(x)))
        x = self.pool2(x)
        x = self.dropout2(x)

        # 3번 
        x = F.relu(self.bn3(self.conv3(x)))
        x = F.relu(self.bn3_2(self.conv3_2(x)))
        x = self.pool3(x)
        x = self.dropout3(x)

        # 평탄화 
        x = x.view(x.size(0), -1)

        # 최종 레이어
        x = F.relu(self.bn_fc(self.fc1(x)))
        x = self.dropout_fc(x)
        x = self.fc2(x)

        return x

# 모델 인스턴스 생성
num_classes = 30  # 클래스 수
model = DrawAingCNN(num_classes=num_classes)

# 가중치 로드
model.load_state_dict(torch.load("draw_classify_model1.pth", map_location="cpu"))

# 모델을 평가 모드로 설정
model.eval()

# 더미 입력 생성 (모델 입력 크기와 동일해야 함)
dummy_input = torch.randn(1, 1, 64, 64)  # (배치 크기, 채널, 높이, 너비)

# ONNX로 변환
torch.onnx.export(model, dummy_input, "draw_classify_model1.onnx", export_params=True, opset_version=11, do_constant_folding=True, input_names=['input'], output_names=['output'])

print("ONNX 모델 변환 완료!")