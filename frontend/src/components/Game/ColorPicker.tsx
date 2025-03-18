import React, { useState, useEffect } from 'react';

interface ColorPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onColorSelect: (color: string) => void;
  initialColor?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  isOpen,
  onClose,
  onColorSelect,
  initialColor = '#8A56E2'
}) => {
  const [activeTab, setActiveTab] = useState('grid'); // 'grid', 'spectrum', 'sliders'
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [opacity, setOpacity] = useState(100);
  
  // 초기 색상 설정
  useEffect(() => {
    if (initialColor) {
      setSelectedColor(initialColor);
    }
  }, [initialColor, isOpen]);

  // 컬러 그리드 생성 (사용하지 않음)
  const generateColorGrid = () => {
    return null;
  };

  // 슬라이더 탭 컨텐츠
  const renderSlidersTab = () => {
    // RGB 색상 추출 (예: #FF0000 -> r:255, g:0, b:0)
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };

    const rgb = hexToRgb(selectedColor);
    
    const handleRgbChange = (channel: 'r' | 'g' | 'b', value: number) => {
      const newRgb = { ...rgb, [channel]: value };
      const newHex = `#${newRgb.r.toString(16).padStart(2, '0')}${newRgb.g.toString(16).padStart(2, '0')}${newRgb.b.toString(16).padStart(2, '0')}`;
      setSelectedColor(newHex);
    };

    return (
      <div className="px-2">
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <span className="w-6 text-red-600 font-bold">R:</span>
            <input
              type="range"
              min="0"
              max="255"
              value={rgb.r}
              onChange={(e) => handleRgbChange('r', parseInt(e.target.value))}
              className="w-full mx-2"
            />
            <span className="w-8 text-sm text-gray-700">{rgb.r}</span>
          </div>
          
          <div className="flex items-center mb-2">
            <span className="w-6 text-green-600 font-bold">G:</span>
            <input
              type="range"
              min="0"
              max="255"
              value={rgb.g}
              onChange={(e) => handleRgbChange('g', parseInt(e.target.value))}
              className="w-full mx-2"
            />
            <span className="w-8 text-sm text-gray-700">{rgb.g}</span>
          </div>
          
          <div className="flex items-center mb-2">
            <span className="w-6 text-blue-600 font-bold">B:</span>
            <input
              type="range"
              min="0"
              max="255"
              value={rgb.b}
              onChange={(e) => handleRgbChange('b', parseInt(e.target.value))}
              className="w-full mx-2"
            />
            <span className="w-8 text-sm text-gray-700">{rgb.b}</span>
          </div>
        </div>
      </div>
    );
  };

  // 프리셋 색상 모음
  const presetColors = [
    '#8A56E2', // 보라색 (현재 선택)
    '#000000', // 검정
    '#2196F3', // 파랑
    '#4CAF50', // 초록
    '#FFEB3B', // 노랑
    '#FF5722', // 주황/빨강
    '#81D4FA', // 하늘
    '#8A56E2', // 보라 (다시)
    '#3F51B5', // 남색
    '#E91E63', // 핑크
  ];

  if (!isOpen) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg w-[340px]" style={{ height: 'auto', maxHeight: '200px' }} onClick={(e) => e.stopPropagation()}>
      {/* 헤더 */}
      <div className="flex justify-between items-center py-1 px-2 border-b">
        <h3 className="font-medium text-sm">Colors</h3>
        <button className="p-0.5 rounded-full bg-gray-200 hover:bg-gray-300" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* 색상 그라데이션 */}
      <div className="p-1">
        <div className="flex h-24 overflow-hidden">
          {Array.from({ length: 20 }).map((_, colIndex) => (
            <div key={colIndex} className="flex-1 flex flex-col">
              {Array.from({ length: 15 }).map((_, rowIndex) => {
                // 색상 그라데이션 생성
                const hue = Math.floor((colIndex / 20) * 360);
                const lightness = 100 - Math.floor((rowIndex / 15) * 85);
                const color = `hsl(${hue}, 100%, ${lightness}%)`;
                
                // 선택된 색상인지 확인 (HSL 값을 HEX로 변환하여 비교하는 것이 정확하지만 여기서는 근사값으로 처리)
                const isSelected = selectedColor === color;
                
                return (
                  <div
                    key={`${colIndex}-${rowIndex}`}
                    className={`w-full h-full cursor-pointer relative transition-all duration-150 ${
                      isSelected ? 'transform scale-110 z-10' : ''
                    }`}
                    style={{ 
                      backgroundColor: color,
                      boxShadow: isSelected ? '0 0 0 1px white, 0 0 0 2px rgba(0,0,0,0.2)' : 'none'
                    }}
                    onClick={() => {
                      setSelectedColor(color);
                      onColorSelect(color); // 바로 색상 적용
                      // 피커는 닫지 않음
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
        
        {/* 자주 사용하는 색상 프리셋 (회색조) */}
        <div className="flex mt-1">
          {['#000000', '#424242', '#757575', '#9E9E9E', '#BDBDBD', '#E0E0E0', '#EEEEEE', '#F5F5F5', '#FFFFFF'].map((color, index) => {
            const isSelected = selectedColor === color;
            
            return (
              <div
                key={index}
                className={`flex-1 h-6 cursor-pointer relative transition-all duration-150 ${
                  isSelected ? 'transform scale-110 z-10' : ''
                }`}
                style={{ 
                  backgroundColor: color,
                  boxShadow: isSelected ? '0 0 0 1px white, 0 0 0 2px rgba(0,0,0,0.2)' : 'none'
                }}
                onClick={() => {
                  setSelectedColor(color);
                  onColorSelect(color); // 바로 색상 적용
                  // 피커는 닫지 않음
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;