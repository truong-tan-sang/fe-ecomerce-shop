"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { productService } from "@/services/product";
import { categoryService } from "@/services/category";
import type { CreateProductDto } from "@/dto/product";
import type { CategoryDto } from "@/dto/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminProductsAddPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateProductDto>>({
    name: "",
    description: "",
    price: 0,
    stockKeepingUnit: "",
    stock: 0,
    categoryId: undefined,
    voucherId: undefined,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories(session?.user?.access_token);
        if (response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("[AddProduct] Failed to fetch categories:", error);
      }
    };

    if (session?.user?.access_token) {
      fetchCategories();
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

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: parseInt(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.access_token || !session?.user?.id) {
      alert("You must be logged in to create a product");
      return;
    }

    if (!formData.name || !formData.description || !formData.stockKeepingUnit || !formData.categoryId) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const createData: CreateProductDto = {
        name: formData.name,
        description: formData.description,
        price: formData.price || 0,
        stockKeepingUnit: formData.stockKeepingUnit,
        stock: formData.stock || 0,
        createByUserId: parseInt(session.user.id),
        categoryId: formData.categoryId,
        voucherId: formData.voucherId,
      };

      console.log("[AddProduct] Submitting product:", createData);
      const response = await productService.createProduct(
        createData,
        session.user.access_token
      );

      if (response.data) {
        alert("Product created successfully!");
        router.push("/admin/products/list");
      } else {
        alert("Failed to create product");
      }
    } catch (error) {
      console.error("[AddProduct] Error creating product:", error);
      alert("An error occurred while creating the product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-600 mt-2">Create a new product for your store</p>
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
                <CardDescription>Provide essential information about the product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description"
                    rows={4}
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
                    placeholder="e.g., PROD-12345"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
                <CardDescription>Set the product price</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="price">Product Price *</Label>
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
                <CardDescription>Manage product stock</CardDescription>
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

          {/* Right Column - Image & Categories */}
          <div className="space-y-6">
            {/* Upload Image - Placeholder for future implementation */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Product Image</CardTitle>
                <CardDescription>Image upload functionality coming soon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-500">Image upload will be implemented in the next iteration</p>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Category</CardTitle>
                <CardDescription>Assign product to a category</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="category">Product Category *</Label>
                  <Select onValueChange={handleCategoryChange} value={formData.categoryId?.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
            {loading ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
