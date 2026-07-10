/**
 * Capability checker for the Fabric bridge runtime.
 * Allows checking which types and features are currently supported.
 */
export class FabricCapability {
  static supportsPath(): boolean {
    return true;
  }

  static supportsText(): boolean {
    return true;
  }

  static supportsSelection(): boolean {
    return true;
  }

  static supportsAnnotations(): boolean {
    return true;
  }
}
