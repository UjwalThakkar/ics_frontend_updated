// components/Services.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  DollarSign,
  FileText,
  Search,
  Filter,
} from "lucide-react";
import { phpAPI } from "@/lib/php-api-client";

// === Raw API Response Shape ===
interface ApiFee {
  type: string;
  amount: number;
}

interface ApiService {
  service_id: number;
  category: string;
  title: string;
  description: string;
  processing_time: string;
  fees: ApiFee[];
  required_documents: string[];
  eligibility_requirements: string[];
  is_active: 1 | 0;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// === Normalized Frontend Service ===
interface Service {
  id: number;
  category: string;
  title: string;
  description: string;
  processingTime: string;
  fees: Array<{
    description: string;
    amount: number;
    currency: string;
  }>;
  requiredDocuments: string[];
  eligibilityRequirements: string[];
  isActive: boolean;
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // === Fetch & Normalize Services ===
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await phpAPI.getServices();
        const apiServices: ApiService[] = response.data.services || [];

        // Normalize to frontend shape
        const normalizedServices: Service[] = apiServices.map((s) => ({
          id: s.service_id,
          category: s.category,
          title: s.title,
          description: s.description,
          processingTime: s.processing_time,
          fees: s.fees.map((f) => ({
            description: f.type.charAt(0).toUpperCase() + f.type.slice(1), // "standard" → "Standard"
            amount: f.amount,
            currency: "ZAR",
          })),
          requiredDocuments: s.required_documents,
          eligibilityRequirements: s.eligibility_requirements,
          isActive: s.is_active === 1,
        }));

        // Sort by display_order then title
        normalizedServices.sort((a, b) => {
          const orderDiff =
            (apiServices.find((s) => s.service_id === a.id)?.display_order ||
              0) -
            (apiServices.find((s) => s.service_id === b.id)?.display_order ||
              0);
          return orderDiff !== 0 ? orderDiff : a.title.localeCompare(b.title);
        });

        setServices(normalizedServices);

        // Extract unique categories
        const categories = Array.from(
          new Set(normalizedServices.map((s) => s.category))
        )
          .filter(Boolean)
          .sort();
        setServiceCategories(categories);
      } catch (err: any) {
        console.error("Failed to fetch services:", err);
        setError(err.message || "Failed to load services.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // === Filter Logic ===
  const filteredServices = services.filter((service) => {
    const matchesCategory =
      selectedCategory === "All" || service.category === selectedCategory;
    const matchesSearch =
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && service.isActive;
  });

  // === Format Fee for Display ===
  const formatFee = (fees: Service["fees"]) => {
    if (!fees || fees.length === 0) return "Contact for fees";
    const standard = fees.find(
      (f) => f.description.toLowerCase() === "standard"
    );
    if (!standard) return `${fees[0].currency} ${fees[0].amount}+`;
    return standard.amount === 0
      ? "No fee"
      : `${standard.currency} ${standard.amount}`;
  };

  // === Loading State ===
  if (loading) {
    return (
      <section className="py-16 bg-gray-50" id="services">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      </section>
    );
  }

  // === Error State ===
  if (error) {
    return (
      <section className="py-16 bg-gray-50" id="services">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50" id="services">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our Consular Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive consular services for Indian nationals and foreign
            citizens.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[200px]"
            >
              <option value="All">All Categories</option>
              {serviceCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === "All"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            All Services ({services.filter((s) => s.isActive).length})
          </button>
          {serviceCategories.map((cat) => {
            const count = services.filter(
              (s) => s.category === cat && s.isActive
            ).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Results Count */}
        <div className="mb-6 text-center text-gray-600">
          Showing {filteredServices.length} service
          {filteredServices.length !== 1 ? "s" : ""}
          {searchTerm && ` for "${searchTerm}"`}
          {selectedCategory !== "All" && ` in ${selectedCategory}`}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              <div className="p-6">
                {/* Category Badge */}
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {service.category}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                  {service.title}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {service.description}
                </p>

                {/* Details */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{service.processingTime}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>{formatFee(service.fees)}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>
                      {service.requiredDocuments.length} document
                      {service.requiredDocuments.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/services/${service.id}`}
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>

                  <div className="flex gap-2">
                    <Link
                      // href={`/apply?service=${service.id}`}
                      href={
                        service.category === "Visa"
                          ? `/apply/VisaForm?service=${service.id}`
                          : service.category === "Passport"
                          ? `/apply/PassportForm?service=${service.id}`
                          : `/apply?service=${service.id}`
                      }
                      className="flex-1 text-center px-3 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 text-sm font-medium"
                    >
                      Apply
                    </Link>
                    <Link
                      href="/appointment"
                      className="flex-1 text-center px-3 py-2 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 text-sm font-medium"
                    >
                      Book Slot
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No services found</p>
            <p className="text-gray-400 mt-1">
              Try adjusting your search or category filter.
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Need Help?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Our consular officers are ready to guide you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-medium"
              >
                Contact Us
              </Link>
              <Link
                href="/appointment"
                className="px-6 py-3 border border-white text-white rounded-lg hover:bg-white hover:text-blue-600 font-medium"
              >
                Book Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
