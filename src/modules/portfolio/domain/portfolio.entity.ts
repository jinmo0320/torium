export type ExpectedReturn = {
  min: number;
  max: number;
};

export namespace Portfolio {
  export type Root = {
    id: number;
    name: string;
    description: string;
    status: "PENDING" | "STABLE" | "DISABLED";
    categories: Category[];
    items: Item[];
    expectedReturn: ExpectedReturn;
    createdAt: string;
    updatedAt: string;
  };

  export type Category = {
    id: number;
    code: string;
    name: string;
    description: string;
    portion: number;
    expectedReturn: ExpectedReturn;
  };

  export type Item = {
    id: number;
    categoryId: number;
    name: string;
    description: string;
    portion: number; // 자산의 절대 비중
    expectedReturn: ExpectedReturn;
  };

  export type Preset = {
    code: string;
    name: string;
    description: string;
    categories: Pick<Category, "name" | "portion">[];
    items: Pick<Item, "id" | "portion">[];
    targetReturnPercent: number;
    expectedReturn: ExpectedReturn;
  };

  export type AvailableCategory = Pick<Category, "id" | "name" | "description">;

  export type AvailableItem = Pick<
    Item,
    "id" | "categoryId" | "name" | "description" | "expectedReturn"
  >;
}
