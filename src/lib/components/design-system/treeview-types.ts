export type TreeNode = {
	id: string;
	label: string;
	description?: string;
	icon?: string;
	disabled?: boolean;
	href?: string;
	children?: TreeNode[];
};

export type FlatNode = {
	node: TreeNode;
	level: number;
	parentId: string | null;
	hasChildren: boolean;
	isExpanded: boolean;
	isSelected: boolean;
	isDisabled: boolean;
};

export type RenderNodeCtx = FlatNode & {
	toggle: () => void;
	select: () => void;
};
