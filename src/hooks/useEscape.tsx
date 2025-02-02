import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect } from "react";

export type UseEscapeProps = {
	onEscape: () => void;
};

export function useEscape({ onEscape }: UseEscapeProps) {
	const handleEscape = useCallback((event: KeyboardEvent) => {
		if (event.key === "Escape") {
			event.preventDefault();

			invoke("hide");
		}
	}, []);

	useEffect(() => {
		window.addEventListener("keydown", handleEscape);

		return () => window.removeEventListener("keydown", handleEscape);
	}, [handleEscape]);
}
