export interface ISelectionInfo {
    text: string;
    position: { x: number; y: number };
    range: Range | null;
}