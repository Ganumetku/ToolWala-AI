import { Mutation } from './MutationTypes';
import { ObjectRegistry } from '../ObjectRegistry';

/**
 * MutationValidator asserts validation boundaries for incoming edits,
 * rejecting operations with invalid properties.
 */
export class MutationValidator {
  /**
   * Returns true if a mutation conforms to layout parameters.
   */
  static validate(mutation: Mutation): boolean {
    const registry = ObjectRegistry.getInstance();
    
    // Verify object existence (skip for AnnotationAdd, where item doesn't exist yet)
    const obj = registry.getObject(mutation.objectId);
    if (!obj && mutation.type !== 'AnnotationAdd') {
      console.warn(`Mutation Validation failed: Object ${mutation.objectId} does not exist in registry.`);
      return false;
    }

    switch (mutation.type) {
      case 'Resize': {
        const state = mutation.afterState;
        if (state.width <= 0 || state.height <= 0 || isNaN(state.width) || isNaN(state.height)) {
          console.warn('Mutation Validation failed: Element dimensions must be greater than zero.');
          return false;
        }
        break;
      }

      case 'Rotate': {
        const state = mutation.afterState;
        if (state.rotation < 0 || state.rotation >= 360 || isNaN(state.rotation)) {
          console.warn('Mutation Validation failed: Rotation angle must sit within [0, 360).');
          return false;
        }
        break;
      }

      case 'Move': {
        const state = mutation.afterState;
        if (isNaN(state.x) || isNaN(state.y)) {
          console.warn('Mutation Validation failed: Move coordinates must be valid numbers.');
          return false;
        }
        break;
      }

      case 'OpacityChange': {
        const state = mutation.afterState;
        if (state.opacity < 0.0 || state.opacity > 1.0 || isNaN(state.opacity)) {
          console.warn('Mutation Validation failed: Opacity must sit within [0.0, 1.0].');
          return false;
        }
        break;
      }
    }

    return true;
  }
}
