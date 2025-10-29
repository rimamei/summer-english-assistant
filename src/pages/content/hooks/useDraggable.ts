import { useState, useCallback, useEffect, useRef } from 'react';

interface IPosition {
    x: number;
    y: number;
}

interface useDraggableProps {
    initialPosition?: IPosition;
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
    const positionRef = useRef(position);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        setPosition(initialPosition);
        positionRef.current = initialPosition;
    }, [initialPosition.x, initialPosition.y]);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDragging(true);
        setDragStart({
            x: e.clientX - positionRef.current.x,
            y: e.clientY - positionRef.current.y,
        });
        e.preventDefault();
    };

    // Use rAF to throttle updates
    const updatePosition = (x: number, y: number) => {
        positionRef.current = { x, y };
        setPosition({ x, y });
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(() => {
            updatePosition(newX, newY);
        });
    }, [isDragging, dragStart.x, dragStart.y]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                    animationFrameRef.current = null;
                }
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return {
        position,
        isDragging,
        handleMouseDown
    };
}