import { useState, useCallback, useEffect } from 'react';

interface IPosition {
    x: number;
    y: number;
}

interface useDraggableProps {
    initialPosition?: IPosition
}

interface UseDraggableReturn {
    position: IPosition;
    isDragging: boolean;
    handleMouseDown: (e: React.MouseEvent) => void;
}

export function useDraggable({ initialPosition = { x: 0, y: 0 } }: useDraggableProps): UseDraggableReturn {
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState(initialPosition);


    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
        e.preventDefault();
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;

        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        setPosition({ x: newX, y: newY });
    }, [isDragging, dragStart.x, dragStart.y]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Add global mouse event listeners for dragging
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return {
        position,
        isDragging,
        handleMouseDown
    };
}