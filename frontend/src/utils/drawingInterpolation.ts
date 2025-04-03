// utils/drawingInterpolation.ts

// 두 점 사이의 거리 계산
export function getDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// 선형 보간 함수
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// 두 점 사이의 보간 포인트 생성
export function interpolatePoints(
  startPoint: { x: number; y: number }, 
  endPoint: { x: number; y: number }, 
  interpolationStep: number = 0.2
): { x: number; y: number }[] {
  const interpolatedPoints: { x: number; y: number }[] = [];
  
  interpolatedPoints.push(startPoint);
  
  for (let t = interpolationStep; t < 1; t += interpolationStep) {
    const interpolatedX = lerp(startPoint.x, endPoint.x, t);
    const interpolatedY = lerp(startPoint.y, endPoint.y, t);
    
    interpolatedPoints.push({ x: interpolatedX, y: interpolatedY });
  }
  
  interpolatedPoints.push(endPoint);
  
  return interpolatedPoints;
}

// 단순 점 부드럽게 처리
export function smoothenDrawingPoints(
  points: { x: number; y: number }[], 
  interpolationStep: number = 0.2
): { x: number; y: number }[] {
  if (points.length <= 1) return points;
  
  const smoothPoints: { x: number; y: number }[] = [points[0]];
  
  for (let i = 1; i < points.length; i++) {
    const interpolatedPoints = interpolatePoints(points[i-1], points[i], interpolationStep);
    smoothPoints.push(...interpolatedPoints.slice(1));
  }
  
  return smoothPoints;
}

/**
 * 향상된 포인트 압축 알고리즘 - 코너와 곡선을 감지하여 더 정확한 압축
 * @param points 그림 포인트 배열
 * @param tolerance 거리 허용 오차 (낮을 수록 더 많은 점 유지)
 */
export function compressDrawingPoints(
  points: { x: number; y: number }[], 
  tolerance: number = 2
): { x: number; y: number }[] {
  if (!points || points.length < 3) return points;
  
  const result: { x: number; y: number }[] = [points[0]];
  let prevPoint = points[0];
  
  for (let i = 1; i < points.length - 1; i++) {
    const currentPoint = points[i];
    const nextPoint = points[i + 1];
    
    // 거리 계산
    const d1 = getDistance(prevPoint, currentPoint);
    const d2 = getDistance(currentPoint, nextPoint);
    
    // 각도 변화 계산 (코너 감지)
    const angle1 = Math.atan2(currentPoint.y - prevPoint.y, currentPoint.x - prevPoint.x);
    const angle2 = Math.atan2(nextPoint.y - currentPoint.y, nextPoint.x - currentPoint.x);
    const angleDiff = Math.abs(angle1 - angle2);
    
    // 다음 조건에 해당하는 점만 유지:
    // 1. 이전 점과 충분히 멀리 떨어진 점
    // 2. 방향이 크게 변하는 점 (코너)
    if (d1 > tolerance || d2 > tolerance || angleDiff > 0.3) {
      result.push(currentPoint);
      prevPoint = currentPoint;
    }
  }
  
  // 항상 마지막 점 포함
  if (points.length > 1) {
    result.push(points[points.length - 1]);
  }
  
  return result;
}

/**
 * Catmull-Rom 스플라인을 사용한 부드러운 곡선 보간
 * @param points 그림 포인트 배열
 * @param segments 각 점 사이에 생성할 세그먼트 수
 */
export function smoothCurveInterpolation(
  points: { x: number; y: number }[], 
  segments: number = 10
): { x: number; y: number }[] {
  if (!points || points.length < 2) return points;
  
  const result: { x: number; y: number }[] = [];
  
  // Catmull-Rom 보간 헬퍼 함수
  const interpolate = (p0: any, p1: any, p2: any, p3: any, t: number) => {
    const t2 = t * t;
    const t3 = t2 * t;
    
    // Catmull-Rom 스플라인 계산
    const v0 = (p2.x - p0.x) / 2;
    const v1 = (p3.x - p1.x) / 2;
    const x = (2 * p1.x - 2 * p2.x + v0 + v1) * t3 + 
              (-3 * p1.x + 3 * p2.x - 2 * v0 - v1) * t2 + 
              v0 * t + p1.x;
              
    const w0 = (p2.y - p0.y) / 2;
    const w1 = (p3.y - p1.y) / 2;
    const y = (2 * p1.y - 2 * p2.y + w0 + w1) * t3 + 
              (-3 * p1.y + 3 * p2.y - 2 * w0 - w1) * t2 + 
              w0 * t + p1.y;
              
    return { x, y };
  };
  
  // 첫 점 추가
  result.push(points[0]);
  
  // 첫 번째와 마지막 세그먼트를 위한 가상 제어점 생성
  const firstControlPoint = {
    x: points[0].x - (points[1].x - points[0].x),
    y: points[0].y - (points[1].y - points[0].y)
  };
  
  const lastControlPoint = {
    x: points[points.length - 1].x + (points[points.length - 1].x - points[points.length - 2].x),
    y: points[points.length - 1].y + (points[points.length - 1].y - points[points.length - 2].y)
  };
  
  // 제어점이 포함된 확장 포인트 배열
  const extendedPoints = [firstControlPoint, ...points, lastControlPoint];
  
  // 보간된 점 생성
  for (let i = 0; i < extendedPoints.length - 3; i++) {
    const p0 = extendedPoints[i];
    const p1 = extendedPoints[i + 1];
    const p2 = extendedPoints[i + 2];
    const p3 = extendedPoints[i + 3];
    
    // 첫 번째 세그먼트가 아니면 시작점 추가 (첫 세그먼트의 시작점은 이미 추가됨)
    if (i > 0) {
      result.push(p1);
    }
    
    // 보간된 점 추가
    for (let j = 1; j <= segments; j++) {
      const t = j / (segments + 1);
      result.push(interpolate(p0, p1, p2, p3, t));
    }
  }
  
  // 마지막 점 추가
  result.push(points[points.length - 1]);
  
  return result;
}

// 베지어 곡선 보간 (기존 함수 유지)
export function bezierCurveInterpolation(
  points: { x: number; y: number }[], 
  tension: number = 0.3
): { x: number; y: number }[] {
  if (points.length <= 2) return points;
  
  const smoothPoints: { x: number; y: number }[] = [points[0]];
  
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const current = points[i];
    const next = points[i + 1];
    
    const controlPoint1 = {
      x: current.x + (next.x - prev.x) * tension,
      y: current.y + (next.y - prev.y) * tension
    };
    
    const controlPoint2 = {
      x: next.x - (next.x - prev.x) * tension,
      y: next.y - (next.y - prev.y) * tension
    };
    
    for (let t = 0; t <= 1; t += 0.1) {
      const point = bezierCurve(prev, controlPoint1, controlPoint2, next, t);
      smoothPoints.push(point);
    }
  }
  
  smoothPoints.push(points[points.length - 1]);
  
  return smoothPoints;
}

// 베지어 곡선 보간 헬퍼 함수 (기존 함수 유지)
function bezierCurve(
  start: { x: number; y: number },
  control1: { x: number; y: number },
  control2: { x: number; y: number },
  end: { x: number; y: number },
  t: number
): { x: number; y: number } {
  const t1 = 1 - t;
  const x = 
    t1 * t1 * t1 * start.x +
    3 * t1 * t1 * t * control1.x +
    3 * t1 * t * t * control2.x +
    t * t * t * end.x;
  
  const y = 
    t1 * t1 * t1 * start.y +
    3 * t1 * t1 * t * control1.y +
    3 * t1 * t * t * control2.y +
    t * t * t * end.y;
  
  return { x, y };
}

/**
 * 드로잉 포인트 배치 처리 최적화
 * @param points 그림 포인트 배열
 * @param maxPoints 배치당 최대 포인트 수
 * @returns 배치 처리된 포인트 배열
 */
export function batchDrawingPoints(
  points: { x: number; y: number }[], 
  maxPoints: number = 20
): Array<Array<{ x: number; y: number }>> {
  if (!points || points.length === 0) return [];
  
  const batches: Array<Array<{ x: number; y: number }>> = [];
  
  for (let i = 0; i < points.length; i += maxPoints) {
    batches.push(points.slice(i, i + maxPoints));
  }
  
  return batches;
}