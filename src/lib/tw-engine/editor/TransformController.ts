import type { TWObject } from '../types';
import { Geometry } from '../Geometry';
import { ObjectRegistry } from '../ObjectRegistry';

/**
 * TransformController manages active drag modifications (move, rotate, scale/resize)
 * on a target object, saving updates into the currentState and editedState maps.
 */
export class TransformController {
  private activeObject: TWObject | null = null;
  private activeHandle: 'TL' | 'TC' | 'TR' | 'ML' | 'MR' | 'BL' | 'BC' | 'BR' | 'ROT' | 'BODY' | null = null;
  
  private startX = 0;
  private startY = 0;
  private startObjX = 0;
  private startObjY = 0;
  private startWidth = 0;
  private startHeight = 0;
  private startRotation = 0;

  /**
   * Validates if there's an interactive body or handle node under position (px, py).
   */
  startTransform(obj: TWObject, px: number, py: number): boolean {
    const handle = this.getHandleAt(obj, px, py);
    if (!handle) {
      this.activeObject = null;
      this.activeHandle = null;
      return false;
    }

    this.activeObject = obj;
    this.activeHandle = handle;
    this.startX = px;
    this.startY = py;
    
    // Read properties from currentState
    const state = obj.currentState as any;
    this.startObjX = state.x;
    this.startObjY = state.y;
    this.startWidth = state.width;
    this.startHeight = state.height;
    this.startRotation = state.rotation;

    return true;
  }

  /**
   * Tracks cursor movements and recalculates offsets to commit edits.
   */
  updateTransform(px: number, py: number): void {
    if (!this.activeObject || !this.activeHandle) return;

    const obj = this.activeObject;
    const registry = ObjectRegistry.getInstance();
    const dx = px - this.startX;
    const dy = py - this.startY;

    switch (this.activeHandle) {
      case 'BODY': {
        const newX = this.startObjX + dx;
        const newY = this.startObjY + dy;

        registry.updateObject(obj.id, {
          x: newX,
          y: newY,
          currentState: {
            ...obj.currentState,
            x: newX,
            y: newY,
          } as any,
          editedState: {
            ...obj.editedState,
            x: newX,
            y: newY,
          } as any,
        });
        break;
      }

      case 'ROT': {
        const cx = this.startObjX + this.startWidth / 2;
        const cy = this.startObjY + this.startHeight / 2;
        
        const angleStart = Math.atan2(this.startY - cy, this.startX - cx);
        const angleCurrent = Math.atan2(py - cy, px - cx);
        
        let diffDegrees = (angleCurrent - angleStart) * (180 / Math.PI);
        let newRotation = (this.startRotation + diffDegrees) % 360;
        if (newRotation < 0) newRotation += 360;

        registry.updateObject(obj.id, {
          rotation: newRotation,
          currentState: {
            ...obj.currentState,
            rotation: newRotation,
          } as any,
          editedState: {
            ...obj.editedState,
            rotation: newRotation,
          } as any,
        });
        break;
      }

      default: {
        // Standard handles TL, TR, BL, BR, TC, BC, ML, MR
        const thetaRad = -this.startRotation * Math.PI / 180;
        const [localDx, localDy] = Geometry.rotatePoint(dx, dy, 0, 0, thetaRad);

        let newWidth = this.startWidth;
        let newHeight = this.startHeight;
        let newX = this.startObjX;
        let newY = this.startObjY;

        // X axis calculations
        if (this.activeHandle.includes('R')) {
          newWidth = Math.max(10, this.startWidth + localDx);
        } else if (this.activeHandle.includes('L')) {
          const deltaW = Math.min(this.startWidth - 10, localDx);
          newWidth = this.startWidth - deltaW;
          
          const cos = Math.cos(this.startRotation * Math.PI / 180);
          const sin = Math.sin(this.startRotation * Math.PI / 180);
          newX = this.startObjX + deltaW * cos;
          newY = this.startObjY + deltaW * sin;
        }

        // Y axis calculations
        if (this.activeHandle.includes('B')) {
          newHeight = Math.max(10, this.startHeight + localDy);
        } else if (this.activeHandle.includes('T')) {
          const deltaH = Math.min(this.startHeight - 10, localDy);
          newHeight = this.startHeight - deltaH;
          
          const cosPerp = -Math.sin(this.startRotation * Math.PI / 180);
          const sinPerp = Math.cos(this.startRotation * Math.PI / 180);
          newX = newX + deltaH * cosPerp;
          newY = newY + deltaH * sinPerp;
        }

        registry.updateObject(obj.id, {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
          currentState: {
            ...obj.currentState,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
          } as any,
          editedState: {
            ...obj.editedState,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
          } as any,
        });
        break;
      }
    }
  }

  /**
   * Resets active drag/transformation scopes.
   */
  stopTransform(): void {
    this.activeObject = null;
    this.activeHandle = null;
  }

  /**
   * Identifies handle or body intersections under position (px, py)
   */
  getHandleAt(
    obj: TWObject,
    px: number,
    py: number
  ): 'TL' | 'TC' | 'TR' | 'ML' | 'MR' | 'BL' | 'BC' | 'BR' | 'ROT' | 'BODY' | null {
    const cx = obj.x + obj.width / 2;
    const cy = obj.y + obj.height / 2;
    const thetaRad = -obj.rotation * Math.PI / 180;
    const [rx, ry] = Geometry.rotatePoint(px, py, cx, cy, thetaRad);

    const localX = rx - obj.x;
    const localY = ry - obj.y;

    const handles = [
      { name: 'TL', x: 0, y: 0 },
      { name: 'TC', x: obj.width / 2, y: 0 },
      { name: 'TR', x: obj.width, y: 0 },
      { name: 'ML', x: 0, y: obj.height / 2 },
      { name: 'MR', x: obj.width, y: obj.height / 2 },
      { name: 'BL', x: 0, y: obj.height },
      { name: 'BC', x: obj.width / 2, y: obj.height },
      { name: 'BR', x: obj.width, y: obj.height },
      { name: 'ROT', x: obj.width / 2, y: -25 },
    ];

    const tolerance = 6;
    for (const h of handles) {
      if (Math.abs(localX - h.x) <= tolerance && Math.abs(localY - h.y) <= tolerance) {
        return h.name as any;
      }
    }

    if (localX >= 0 && localX <= obj.width && localY >= 0 && localY <= obj.height) {
      return 'BODY';
    }

    return null;
  }
}
