export type Category =
  | "electronics"
  | "jewelery"
  | "men's clothing"
  | "women's clothing";

export interface ProductRating {
  rate: number;
  count: number;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: Category;
  image: string;
  rating: ProductRating;
}
