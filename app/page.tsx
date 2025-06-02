"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Plus, MapPin, Calendar, User, Phone, Mail, Filter, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

interface LostItem {
  _id: string
  title: string
  description: string
  category: string
  location: string
  date: string
  contactName: string
  contactPhone: string
  contactEmail: string
  image: string
  status: "lost" | "found"
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  success: boolean
  data?: LostItem[]
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
  missingFields?: string[]
  validationErrors?: { field: string; message: string }[]
}

const categories = ["Electronics", "Books", "Clothing", "Accessories", "Documents", "Sports Equipment", "Other"]

export default function LostAndFoundPage() {
  const [items, setItems] = useState<LostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    status: "lost" as "lost" | "found",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchItems = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (selectedStatus !== 'all') params.append('status', selectedStatus)

      const response = await fetch(`/api/lost-items?${params.toString()}`)
      const result: ApiResponse = await response.json()

      if (result.success && result.data) {
        setItems(result.data)
        setError(null)
      } else {
        setError(result.error || 'Failed to fetch items')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [searchTerm, selectedCategory, selectedStatus])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 4 * 1024 * 1024) {
        setError('Image size must be less than 4MB')
        return
      }
      
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.description || !newItem.category || 
        !newItem.location || !newItem.contactName || !newItem.contactPhone) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      setSuccess(null)
      const formData = new FormData()
      formData.append('title', newItem.title)
      formData.append('description', newItem.description)
      formData.append('category', newItem.category)
      formData.append('location', newItem.location)
      formData.append('contactName', newItem.contactName)
      formData.append('contactPhone', newItem.contactPhone)
      formData.append('contactEmail', newItem.contactEmail)
      formData.append('status', newItem.status)
      if (imageFile) {
        formData.append('image', imageFile)
      }

      const response = await fetch('/api/lost-items', {
        method: 'POST',
        body: formData,
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        setSuccess(result.message || 'Item reported successfully!')
        setNewItem({
          title: "",
          description: "",
          category: "",
          location: "",
          contactName: "",
          contactPhone: "",
          contactEmail: "",
          status: "lost",
        })
        setImageFile(null)
        setImagePreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        setShowAddForm(false)
        fetchItems()
      } else {
        if (result.validationErrors) {
          const errorMessages = result.validationErrors.map(err => err.message).join(', ')
          setError(errorMessages)
        } else {
          setError(result.error || 'Failed to submit item')
        }
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Submit error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Lost & Found
                </h1>
                <p className="text-sm text-gray-600">St Joseph College of Engineering and Technology Palai</p>
              </div>
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Report Item
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Alerts */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Find What You've Lost
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with your college community to recover lost items or help others find theirs. Together, we can
            reunite belongings with their owners.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for lost items, locations, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg border-2 border-purple-200 focus:border-purple-400 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Add Item Form */}
        {showAddForm && (
          <Card className="mb-8 border-2 border-purple-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="text-2xl text-purple-800">Report a Lost or Found Item</CardTitle>
              <CardDescription>Help your fellow students by reporting items you've lost or found</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={newItem.status}
                      onValueChange={(value: "lost" | "found") => setNewItem({ ...newItem, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lost">Lost Item</SelectItem>
                        <SelectItem value="found">Found Item</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="title">Item Title *</Label>
                    <Input
                      id="title"
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                      placeholder="e.g., iPhone 14, Blue Backpack"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={newItem.category}
                      onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={newItem.location}
                      onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                      placeholder="e.g., Library 2nd Floor, Cafeteria"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <Label htmlFor="image">Item Photo (Optional, max 4MB)</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      ref={fileInputRef}
                    />
                    {imagePreview && (
                      <div className="mt-2 relative">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          width={200}
                          height={200}
                          className="rounded-md border border-gray-200 object-cover h-40 w-full"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1 h-8 w-8"
                        >
                          <X className="w-4 h-4 text-gray-700" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder="Detailed description of the item..."
                      rows={3}
                      maxLength={500}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactName">Your Name *</Label>
                    <Input
                      id="contactName"
                      value={newItem.contactName}
                      onChange={(e) => setNewItem({ ...newItem, contactName: e.target.value })}
                      placeholder="Full name"
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Phone Number *</Label>
                    <Input
                      id="contactPhone"
                      value={newItem.contactPhone}
                      onChange={(e) => setNewItem({ ...newItem, contactPhone: e.target.value })}
                      placeholder="+91 9876543210 (add proper country code)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">Email (Optional)</Label>
                    <Input
                      id="contactEmail"
                      value={newItem.contactEmail}
                      onChange={(e) => setNewItem({ ...newItem, contactEmail: e.target.value })}
                      placeholder="your.email@sjcet.ac.in"
                      type="email"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <Button
                  onClick={handleAddItem}
                  disabled={submitting}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Report'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-800">Filters:</span>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="found">Found</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-2 text-purple-600">Loading items...</span>
          </div>
        )}

        {/* Items Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <Card
                key={item._id}
                className={`overflow-hidden border-2 hover:border-purple-300 transition-all duration-300 hover:shadow-lg ${
                  item.status === "lost" ? "border-red-200 bg-red-50/30" : "border-green-200 bg-green-50/30"
                }`}
              >
                <div className="relative">
                  <div className="aspect-square relative">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <Badge
                    className={`absolute top-3 right-3 ${
                      item.status === "lost" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                    } text-white`}
                  >
                    {item.status === "lost" ? "LOST" : "FOUND"}
                  </Badge>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl text-gray-800">{item.title}</CardTitle>
                  <CardDescription className="text-gray-600">{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-purple-700">
                      <MapPin className="w-4 h-4" />
                      <span>{item.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-700">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-700">
                      <User className="w-4 h-4" />
                      <span>{item.contactName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-700">
                      <Phone className="w-4 h-4" />
                      <span>{item.contactPhone}</span>
                    </div>
                    {item.contactEmail && (
                      <div className="flex items-center gap-2 text-purple-700">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{item.contactEmail}</span>
                      </div>
                    )}
                  </div>
                  <Badge variant="secondary" className="mt-3 bg-purple-100 text-purple-800">
                    {item.category}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No items found</h3>
            <p className="text-gray-500">Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-800 to-pink-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-semibold mb-2">St Joseph College of Engineering and Technology Palai</h3>
          <p className="text-purple-200 mb-4">Lost & Found Portal - Connecting Our Community</p>
          <p className="text-sm text-purple-300">
            Help make our campus a better place by reporting lost and found items
          </p>
        </div>
      </footer>
    </div>
  )
}