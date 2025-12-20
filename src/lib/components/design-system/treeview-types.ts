export type TreeNode<T = unknown> = {
	id: string;
	label: string;
	description?: string;
	icon?: string;
	disabled?: boolean;
	href?: string;
	data?: T;
	ariaLabel?: string;
	ariaRole?: string;
	children?: TreeNode<T>[];
};

export type FlatNode<T = unknown> = {
	node: TreeNode<T>;
	level: number;
	parentId: string | null;
	hasChildren: boolean;
	isExpanded: boolean;
	isSelected: boolean;
	isDisabled: boolean;
};

export type RenderNodeCtx<T = unknown> = FlatNode<T> & {
	toggle: () => void;
	select: () => void;
};
