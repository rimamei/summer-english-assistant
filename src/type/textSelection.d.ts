export interface ISelectionInfo {
  text: string;
  position: { x: number; y: number } | null;
  range: Range | null;
}
