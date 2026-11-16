import { Product, SiteContent } from './types';

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Oversized Essential Tee",
    price: 250.00,
    category: "Unisex",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80",
    description: "A staple for any wardrobe. Made from 100% organic cotton with a relaxed boxy fit.",
    stock: 25
  },
  {
    id: "2",
    name: "Utility Cargo Joggers",
    price: 650.00,
    category: "Men",
    image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=700&q=80",
    description: "Functional and stylish. Features multiple pockets and adjustable cuffs for the perfect street fit.",
    stock: 15
  },
  {
    id: "3",
    name: "Vintage Wash Denim Jacket",
    price: 899.00,
    category: "Unisex",
    image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=700&q=80",
    description: "Classic denim with a modern distressed look. Perfect for layering over hoodies or dresses.",
    stock: 8
  },
  {
    id: "4",
    name: "Ribbed Midi Dress",
    price: 550.00,
    category: "Women",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=700&q=80",
    description: "Elegant silhouette suitable for office or casual wear. Features a side slit and premium knit fabric.",
    stock: 12
  },
  {
    id: "5",
    name: "Chunky Knit Sweater",
    price: 599.00,
    category: "Women",
    image: "https://images.unsplash.com/photo-1620799140408-ed5341cd2431?auto=format&fit=crop&w=700&q=80",
    description: "Warm, textured knitwear for those breezy city nights. Neutral tone matches everything.",
    stock: 20
  },
  {
    id: "6",
    name: "Everyday Fleece Hoodie",
    price: 499.00,
    category: "Unisex",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=700&q=80",
    description: "Soft fleece interior with a modern cut. The ultimate comfort piece for home or street.",
    stock: 30
  },
  {
    id: "7",
    name: "Tailored Linen Trousers",
    price: 699.00,
    category: "Women",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=700&q=80",
    description: "Breathable linen blend. High-waisted fit with a wide leg for effortless elegance.",
    stock: 10
  },
  {
    id: "8",
    name: "Classic Chelsea Boots",
    price: 1200.00,
    category: "Footwear",
    image: "https://images.unsplash.com/photo-1605733513597-a8f8341084f6?auto=format&fit=crop&w=700&q=80",
    description: "Premium leather construction with durable soles. Built to last through the seasons.",
    stock: 5
  },
  {
    id: "9",
    name: "Structured Blazer",
    price: 999.00,
    category: "Men",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=700&q=80",
    description: "Sharp tailoring for the modern professional. Versatile enough for business or smart-casual events.",
    stock: 7
  },
  {
    id: "10",
    name: "Canvas Weekender",
    price: 750.00,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80",
    description: "Durable canvas tote with leather handles. Ample space for your daily essentials or a weekend trip.",
    stock: 18
  }
];

const COLLECTIONS = [
  { id: 1, name: "Summer Breeze", image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80" },
  { id: 2, name: "Monochrome Edit", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80" },
  { id: 3, name: "City Nights", image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=800&q=80" },
];

export const DEFAULT_SITE_CONTENT: SiteContent = {
  hero: {
    headlinePart1: "Wear your story,",
    headlinePart2: "unapologetically.",
    subheadline: "Fashion isn't just about clothes; it's about how you feel when you walk out the door. Discover sustainable, inclusive styles crafted for the vibrant streets of South Africa.",
    buttonText: "Explore Collection",
    image: "https://images.unsplash.com/photo-1529139574466-a3005241eb5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
  },
  collections: COLLECTIONS
};