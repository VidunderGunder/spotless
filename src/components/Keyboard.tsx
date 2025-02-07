import { useEffect, useState } from "react";
import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";
import type { KeyboardKey, Modifier } from "@/types/keyboard";

export type KeyboardProps = {
	code: string;
	interactive?: boolean;
	dark?: boolean;
} & ComponentProps<"kbd">;

export const codeToLabel = {
	Space: "Space",
	Backspace: "Backspace",
	Enter: "Enter",
	Escape: "Esc",

	// Shift
	ShiftLeft: "⇧",
	ShiftRight: "⇧",
	Shift: "⇧",

	// Control
	ControlLeft: "⌃",
	ControlRight: "⌃",
	Control: "⌃",

	// Alt / Option
	AltLeft: "⌥",
	AltRight: "⌥",
	Alt: "⌥",

	// Meta (Command on Mac, Windows key on Windows, etc.)
	MetaLeft: "⌘",
	MetaRight: "⌘",
	Meta: "⌘",

	// Arrows
	ArrowUp: "▲",
	ArrowDown: "▼",
	ArrowLeft: "◄",
	ArrowRight: "►",
} as const satisfies Record<string, React.ReactNode>;

export function getLabelFromCode(code?: string) {
	if (!code) return code;
	if (code.slice(0, 3) === "Key") return code.slice(3);
	if (code.slice(0, 5) === "Digit") return code.slice(5);
	return code in codeToLabel
		? codeToLabel[code as keyof typeof codeToLabel]
		: code;
}

function getIsModifier(code: string): code is Modifier {
	return Object.keys(modifiers).includes(code);
}

export function useKeyboard(code: Modifier | KeyboardKey) {
	const [pressed, setPressed] = useState(false);
	const isModifier = getIsModifier(code);

	useEffect(() => {
		if (!code) return;

		function handleKeyDown(e: KeyboardEvent) {
			if (isModifier) {
				const modifier = modifiers[code as keyof typeof modifiers];
				if (modifier.codes.includes(e.code)) setPressed(true);
			} else if (e.code === code) {
				setPressed(true);
			}
		}

		function handleKeyUp(e: KeyboardEvent) {
			if (isModifier) {
				const modifier = modifiers[code as keyof typeof modifiers];
				if (modifier.codes.includes(e.code)) setPressed(false);
			} else if (e.code === code) {
				setPressed(false);
			} else if (!e.getModifierState("Meta") && !e.getModifierState("Alt")) {
				// If we suspect KeyK was stuck, we can reset it here...
				setPressed(false);
			}
		}

		function handleWindowBlur() {
			setPressed(false);
		}

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);
		window.addEventListener("blur", handleWindowBlur);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
			window.removeEventListener("blur", handleWindowBlur);
		};
	}, [code, isModifier]);

	return { pressed, isModifier };
}

export function useModifiers() {
	const { pressed: Shift } = useKeyboard("Shift");
	const { pressed: Control } = useKeyboard("Control");
	const { pressed: Alt } = useKeyboard("Alt");
	const { pressed: Meta } = useKeyboard("Meta");

	return {
		Shift,
		Control,
		Alt,
		Meta,
	};
}

const modifiers = {
	Alt: {
		codes: ["AltLeft", "AltRight"],
	},
	Control: {
		codes: ["ControlLeft", "ControlRight"],
	},
	Meta: {
		codes: ["MetaLeft", "MetaRight"],
	},
	Shift: {
		codes: ["ShiftLeft", "ShiftRight"],
	},
};

export function Keyboard({
	children,
	code,
	className,
	dark = false,
	interactive = false,
	...props
}: KeyboardProps) {
	const label = children ?? getLabelFromCode(code);

	const { pressed: _pressed, isModifier } = useKeyboard(code);

	const pressed = !interactive ? false : _pressed;

	return (
		<kbd
			className={cn(
				// Tailwind (or any utility) classes to give a modern, subtle look
				"inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-md border px-1 py-1 font-mono text-sm",
				isModifier ? "text-sm" : "text-xs",
				dark
					? "border-gray-800 bg-gray-900 text-gray-200 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.025)]"
					: "border-gray-400 bg-gray-400 text-gray-800 shadow-[0px_2px_0px_0px_rgba(0,0,0,0.025)]",
				// When pressed, add a slightly darker background/border
				pressed && dark ? "border-gray-800 bg-gray-700" : "",
				pressed && !dark ? "border-gray-50 bg-white" : "",
				className,
			)}
			{...props}
		>
			{typeof label === "string" ? label.toUpperCase() : label}
		</kbd>
	);
}

export function ArrowKeys({
	className,
	dark,
	interactive,
	directions = "all",
	wasd = true,
	...props
}: ComponentProps<"div"> &
	Pick<KeyboardProps, "dark" | "interactive"> & {
		wasd?: boolean;
		directions?: "all" | "horizontal" | "vertical";
	}) {
	const keyboardProps = { dark, interactive };

	return (
		<div className={cn("flex gap-2", className)}>
			{wasd && (
				<div className="flex items-end gap-0.5">
					{["all", "horizontal"].includes(directions) && (
						<Keyboard code="KeyA" {...keyboardProps} className="text-[11px]" />
					)}
					{["all", "vertical"].includes(directions) && (
						<div className="flex flex-col">
							<Keyboard
								code="KeyW"
								className="h-[15px] rounded-b-none text-[8px]"
								{...keyboardProps}
							/>
							<Keyboard
								code="KeyS"
								className="h-[15px] rounded-t-none text-[8px]"
								{...keyboardProps}
							/>
						</div>
					)}
					{["all", "horizontal"].includes(directions) && (
						<Keyboard code="KeyD" {...keyboardProps} className="text-[11px]" />
					)}
				</div>
			)}
			{/* Slanted separator like a big slash */}
			<div
				className={cn(
					"h-[20px] w-[1px] rotate-6 transform",
					dark ? "bg-gray-700" : "bg-gray-300",
				)}
			/>
			<div className="flex items-end gap-0.5" {...props}>
				{["all", "horizontal"].includes(directions) && (
					<Keyboard code="ArrowLeft" {...keyboardProps} />
				)}
				{["all", "vertical"].includes(directions) && (
					<div className="flex flex-col">
						<Keyboard
							code="ArrowUp"
							className="h-[15px] rounded-b-none"
							{...keyboardProps}
						/>
						<Keyboard
							code="ArrowDown"
							className="h-[15px] rounded-t-none"
							{...keyboardProps}
						/>
					</div>
				)}
				{["all", "horizontal"].includes(directions) && (
					<Keyboard code="ArrowRight" {...keyboardProps} />
				)}
			</div>
		</div>
	);
}
