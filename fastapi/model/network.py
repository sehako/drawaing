import os
import torch
import torch.nn as nn
import torch.nn.functional as F

class ModifiedShuffleNetV2(nn.Module):
    def __init__(self, num_classes):
        super(ModifiedShuffleNetV2, self).__init__()
        
        # ShuffleNetV2 모델 불러옴
        shufflenet_v2 = models.shufflenet_v2_x0_5(pretrained=True)  # 작은 버전 사용 (0.5x)
        
        # 마지막 fully connected layer를 num_classes에 맞게 수정
        shufflenet_v2.fc = nn.Linear(shufflenet_v2.fc.in_features, num_classes)
        
        # 모델 설정
        self.model = shufflenet_v2
    
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