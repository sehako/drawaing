import os
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.models as models

class ModifiedMnasNet(nn.Module): # 쓰지 말 것. 속도도 느린데 성능도 안 좋게 나옴...
    def __init__(self, num_classes):
        super(ModifiedMnasNet, self).__init__()
        
        # MnasNet 모델 불러오기 (pretrained=False)
        mnasnet = models.mnasnet1_0(weights=None)  # pretrained=False로 설정
        
        # 수동으로 받은 모델의 state_dict을 불러오기
        model_path = 'model/mnasnet1.0_top1_73.512-f206786ef8.pth'  # 수동으로 다운로드한 모델의 경로
        mnasnet.load_state_dict(torch.load(model_path))  # 모델 가중치 로드
        
        # 마지막 classifier 레이어 수정
        mnasnet.classifier[1] = nn.Linear(mnasnet.classifier[1].in_features, num_classes)
        
        # 모델 설정
        self.model = mnasnet
    
    def forward(self, x):
        return self.model(x)

def save_model(model, model_name, save_dir='models'):
    """Save model to file"""
    os.makedirs(save_dir, exist_ok=True)
    torch.save(model, f"{save_dir}/{model_name}.pth") # model.state_dict()을 저장하면 가중치만 저장됌. 현재는 모델 구성요소까지 저장
    print(f"Model {model_name} saved successfully")

def load_model(model, model_name, load_dir='models'):
    """Load model from file"""
    model.load_state_dict(torch.load(f"{load_dir}/{model_name}.pth"))
    return model