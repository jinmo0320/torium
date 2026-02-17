export type ExpectedReturn = {
  min: number;
  max: number;
};

export namespace Portfolio {
  export type Root = {
    id: number;
    name: string;
    description: string;
    categories: Category[];
    items: Item[];
    expectedReturn: ExpectedReturn;
    isCustomized: boolean;
    updatedAt: string;
  };

  export type Category = {
    id: number;
    code: string;
    name: string;
    description: string;
    portion: number;
  };

  export type Item = {
    id: number;
    categoryId: number;
    masterItemId: number;
    name: string;
    description: string;
    portion: number; // 자산의 절대 비중
    expectedReturn: ExpectedReturn;
    isCustomReturn: boolean;
    isCustom: boolean;
  };

  export type Preset = {
    code: string;
    name: string;
    description: string;
    categories: Pick<Category, "name" | "portion">[];
    targetReturnPercent: number;
    expectedReturn: ExpectedReturn;
  };

  export type AvailableCategory = Pick<Category, "id" | "name" | "description">;

  export type AvailableItem = Pick<
    Item,
    "id" | "categoryId" | "name" | "description" | "expectedReturn"
  >;
}
