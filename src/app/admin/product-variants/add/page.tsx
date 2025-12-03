"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { productVariantService } from "@/services/product-variant";
import { productService } from "@/services/product";
import type { CreateProductVariantDto } from "@/dto/product-variant";
import type { ProductDto } from "@/dto/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  { name: "Red", value: "red", hex: "#ef4444" },
  { name: "Blue", value: "blue", hex: "#3b82f6" },
  { name: "Green", value: "green", hex: "#22c55e" },
  { name: "Yellow", value: "yellow", hex: "#eab308" },
  { name: "Purple", value: "purple", hex: "#a855f7" },
  { name: "Pink", value: "pink", hex: "#ec4899" },
  { name: "Orange", value: "orange", hex: "#f97316" },
  { name: "Black", value: "black", hex: "#000000" },
  { name: "White", value: "white", hex: "#ffffff" },
  { name: "Gray", value: "gray", hex: "#6b7280" },
];

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export default function AddProductVariantPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateProductVariantDto>>({
    productId: undefined,
    variantName: "",
    variantColor: "",
    variantSize: "",
    price: 0,
    stock: 0,
    stockKeepingUnit: "",
    voucherId: undefined,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getAllProducts({
          page: 1,
          perPage: 100,
          accessToken: session?.user?.access_token,
        });
        if (response.data) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error("[AddProductVariant] Failed to fetch products:", error);
      }
    };

    if (session?.user?.access_token) {
      fetchProducts();
    }
  }, [session]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? parseInt(value) || 0 : value,
    }));
  };

  const handleColorSelect = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      variantColor: color,
    }));
  };

  const handleSizeSelect = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      variantSize: size,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.access_token || !session?.user?.id) {
      alert("You must be logged in to create a product variant");
      return;
    }

    if (
      !formData.productId ||
      !formData.variantName ||
      !formData.variantColor ||
      !formData.variantSize ||
      !formData.stockKeepingUnit
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const createData: CreateProductVariantDto = {
        productId: formData.productId,
        createByUserId: parseInt(session.user.id),
        variantName: formData.variantName,
        variantColor: formData.variantColor,
        variantSize: formData.variantSize,
        price: formData.price || 0,
        stock: formData.stock || 0,
        stockKeepingUnit: formData.stockKeepingUnit,
        voucherId: formData.voucherId,
      };

      console.log("[AddProductVariant] Submitting product variant:", createData);
      const response = await productVariantService.createProductVariant(
        createData,
        session.user.access_token
      );

      if (response.data) {
        alert("Product variant created successfully!");
        router.push("/admin/products/list");
      } else {
        alert("Failed to create product variant");
      }
    } catch (error) {
      console.error("[AddProductVariant] Error creating product variant:", error);
      alert("An error occurred while creating the product variant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Add New Product Variant</h1>
        <p className="text-gray-600 mt-2">Create a new variant for an existing product</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Two Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column - Basic Details & Pricing */}
          <div className="space-y-6">
            {/* Basic Details */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Details</CardTitle>
                <CardDescription>Provide essential information about the variant</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="product">Parent Product *</Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                      >
                        {formData.productId
                          ? products.find((product) => parseInt(product.id) === formData.productId)?.name
                          : "Select a product..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search products..." />
                        <CommandList>
                          <CommandEmpty>No product found.</CommandEmpty>
                          <CommandGroup>
                            {products.map((product) => (
                              <CommandItem
                                key={product.id}
                                value={`${product.id}-${product.name}`}
                                onSelect={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    productId: parseInt(product.id),
                                  }));
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.productId === parseInt(product.id) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {product.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="variantName">Variant Name *</Label>
                  <Input
                    id="variantName"
                    name="variantName"
                    value={formData.variantName}
                    onChange={handleInputChange}
                    placeholder="e.g., Red XL T-Shirt"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stockKeepingUnit">SKU (Stock Keeping Unit) *</Label>
                  <Input
                    id="stockKeepingUnit"
                    name="stockKeepingUnit"
                    value={formData.stockKeepingUnit}
                    onChange={handleInputChange}
                    placeholder="e.g., PROD-VAR-12345"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
                <CardDescription>Set the variant price</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="price">Variant Price *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="1"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0"
                      required
                    />
                    <span className="text-sm text-gray-600 min-w-[40px]">VND</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
                <CardDescription>Manage variant stock</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    step="1"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Image, Color & Size */}
          <div className="space-y-6">
            {/* Upload Image - Placeholder for future implementation */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Variant Image</CardTitle>
                <CardDescription>Image upload functionality coming soon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-500">Image upload will be implemented in the next iteration</p>
                </div>
              </CardContent>
            </Card>

            {/* Color Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Color *</CardTitle>
                <CardDescription>Select variant color</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-3">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleColorSelect(color.value)}
                        className={`relative aspect-square rounded-lg border-2 transition-all hover:scale-105 ${
                          formData.variantColor === color.value
                            ? "border-black ring-2 ring-black ring-offset-2"
                            : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {formData.variantColor === color.value && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke={color.value === "white" || color.value === "yellow" ? "black" : "white"}
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <div>
                    <Label htmlFor="customColor">Or enter custom color</Label>
                    <Input
                      id="customColor"
                      value={formData.variantColor}
                      onChange={(e) => handleColorSelect(e.target.value)}
                      placeholder="e.g., navy blue"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Size Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Size *</CardTitle>
                <CardDescription>Select variant size</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSizeSelect(size)}
                        className={`py-2 px-4 rounded-lg border-2 font-medium transition-all hover:scale-105 ${
                          formData.variantSize === size
                            ? "border-black bg-black text-white"
                            : "border-gray-300 text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <div>
                    <Label htmlFor="customSize">Or enter custom size</Label>
                    <Input
                      id="customSize"
                      value={formData.variantSize}
                      onChange={(e) => handleSizeSelect(e.target.value)}
                      placeholder="e.g., 32W x 34L"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Variant"}
          </Button>
        </div>
      </form>
    </div>
  );
}
