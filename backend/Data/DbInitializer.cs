using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(DataContext context)
    {
        try
        {
            // Check if tables exist in Supabase, if not execute DDL script
            try
            {
                await context.Users.AnyAsync();
            }
            catch
            {
                Console.WriteLine("[DbInitializer] Tables not found. Creating tables on Supabase...");
                var createScript = context.Database.GenerateCreateScript();
                await context.Database.ExecuteSqlRawAsync(createScript);
                Console.WriteLine("[DbInitializer] Tables created successfully on Supabase!");
            }

            // 1. Seed Users (Admin & Customer)
            if (!await context.Users.AnyAsync())
            {
                var adminUser = new User
                {
                    Name = "Admin Manager",
                    Email = "admin@webstore.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Initials = "AM",
                    Role = Role.Admin,
                    Cart = new Cart()
                };

                var testCustomer = new User
                {
                    Name = "John Doe",
                    Email = "customer@webstore.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("Customer@123"),
                    Initials = "JD",
                    Role = Role.Customer,
                    Cart = new Cart()
                };

                context.Users.AddRange(adminUser, testCustomer);
                await context.SaveChangesAsync();
            }

            // 2. Seed Categories
            if (!await context.Categories.AnyAsync())
            {
                var categories = new List<Category>
                {
                    new Category
                    {
                        Name = "Smartphones",
                        Description = "Flagship smartphones, 5G devices and folding phones",
                        Icon = "Smartphone",
                        Image = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80"
                    },
                    new Category
                    {
                        Name = "Laptops",
                        Description = "Ultra-portable laptops, workstation and gaming gear",
                        Icon = "Laptop",
                        Image = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80"
                    },
                    new Category
                    {
                        Name = "Audio & Headphones",
                        Description = "Wireless noise-canceling headphones, earbuds and speakers",
                        Icon = "Headphones",
                        Image = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80"
                    },
                    new Category
                    {
                        Name = "Smartwatches",
                        Description = "Fitness trackers, cellular smartwatches and wearable tech",
                        Icon = "Watch",
                        Image = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"
                    },
                    new Category
                    {
                        Name = "Accessories",
                        Description = "Fast GaN chargers, wireless pads, protective cases and cables",
                        Icon = "Cable",
                        Image = "https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=600&auto=format&fit=crop&q=80"
                    }
                };

                context.Categories.AddRange(categories);
                await context.SaveChangesAsync();
            }

            // 3. Seed Products
            if (!await context.Products.AnyAsync())
            {
                var categories = await context.Categories.ToListAsync();
                var phoneCat = categories.FirstOrDefault(c => c.Name == "Smartphones") ?? categories[0];
                var laptopCat = categories.FirstOrDefault(c => c.Name == "Laptops") ?? categories[0];
                var audioCat = categories.FirstOrDefault(c => c.Name == "Audio & Headphones") ?? categories[0];
                var watchCat = categories.FirstOrDefault(c => c.Name == "Smartwatches") ?? categories[0];
                var accCat = categories.FirstOrDefault(c => c.Name == "Accessories") ?? categories[0];

                var products = new List<Product>
                {
                    // Phones
                    new Product
                    {
                        Name = "Titanium Pro Max 256GB",
                        Price = 1199.99m,
                        Description = "Forged in aerospace-grade titanium with the powerful A17 Pro chip, Super Retina XDR display, and 48MP main camera system.",
                        Image = "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
                        Rating = 4.9,
                        StockQuantity = 45,
                        CategoryId = phoneCat.Id,
                        CategoryName = phoneCat.Name
                    },
                    new Product
                    {
                        Name = "Galaxy Ultra S24 AI 512GB",
                        Price = 1299.00m,
                        Description = "Powered by Galaxy AI with Live Translate, Note Assist, titanium frame, and built-in S Pen stylus.",
                        Image = "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80",
                        Rating = 4.8,
                        StockQuantity = 38,
                        CategoryId = phoneCat.Id,
                        CategoryName = phoneCat.Name
                    },
                    new Product
                    {
                        Name = "Pixel Fold 9 OLED Pro",
                        Price = 1499.00m,
                        Description = "Groundbreaking folding experience with dual high-refresh OLED displays, Google Tensor G4, and unmatched computational photography.",
                        Image = "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80",
                        Rating = 4.7,
                        StockQuantity = 20,
                        CategoryId = phoneCat.Id,
                        CategoryName = phoneCat.Name
                    },

                    // Laptops
                    new Product
                    {
                        Name = "MacBook Pro 16\" M3 Max",
                        Price = 2499.00m,
                        Description = "Mind-blowing speed with 36GB unified memory, Liquid Retina XDR display with ProMotion 120Hz, and up to 22 hours battery life.",
                        Image = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
                        Rating = 5.0,
                        StockQuantity = 15,
                        CategoryId = laptopCat.Id,
                        CategoryName = laptopCat.Name
                    },
                    new Product
                    {
                        Name = "ZenBook Duo 14\" Dual Touchscreen",
                        Price = 1699.99m,
                        Description = "Dual 3K 120Hz OLED touchscreens for ultimate mobile productivity with Intel Core Ultra 9 processor and detachable magnetic keyboard.",
                        Image = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80",
                        Rating = 4.6,
                        StockQuantity = 22,
                        CategoryId = laptopCat.Id,
                        CategoryName = laptopCat.Name
                    },
                    new Product
                    {
                        Name = "Razer Blade 15 RTX 4080 Gaming Laptop",
                        Price = 2199.00m,
                        Description = "CNC aluminum unibody with 240Hz QHD display, NVIDIA GeForce RTX 4080 graphics, and per-key RGB Chroma lighting.",
                        Image = "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80",
                        Rating = 4.8,
                        StockQuantity = 18,
                        CategoryId = laptopCat.Id,
                        CategoryName = laptopCat.Name
                    },

                    // Audio
                    new Product
                    {
                        Name = "Sony WH-1000XM5 ANC Headphones",
                        Price = 398.00m,
                        Description = "Industry-leading noise canceling with 8 microphones, Auto NC Optimizer, and 30-hour battery life with quick charging.",
                        Image = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
                        Rating = 4.9,
                        StockQuantity = 60,
                        CategoryId = audioCat.Id,
                        CategoryName = audioCat.Name
                    },
                    new Product
                    {
                        Name = "AirPods Pro Gen 2 USB-C",
                        Price = 249.00m,
                        Description = "Up to 2x more Active Noise Cancellation, Adaptive Audio, Transparency mode, and Personalized Spatial Audio with dynamic head tracking.",
                        Image = "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80",
                        Rating = 4.9,
                        StockQuantity = 85,
                        CategoryId = audioCat.Id,
                        CategoryName = audioCat.Name
                    },
                    new Product
                    {
                        Name = "Bose SoundLink Revolve+ II Bluetooth Speaker",
                        Price = 299.00m,
                        Description = "Astonishingly loud, true 360-degree sound with deep bass, water-resistant aluminum design and flexible fabric handle.",
                        Image = "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
                        Rating = 4.7,
                        StockQuantity = 34,
                        CategoryId = audioCat.Id,
                        CategoryName = audioCat.Name
                    },

                    // Smartwatches
                    new Product
                    {
                        Name = "Apple Watch Ultra 2 Titanium 49mm",
                        Price = 799.00m,
                        Description = "Rugged and capable titanium case with precision dual-frequency GPS, customizable Action button, and 3000-nit display.",
                        Image = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
                        Rating = 4.9,
                        StockQuantity = 30,
                        CategoryId = watchCat.Id,
                        CategoryName = watchCat.Name
                    },
                    new Product
                    {
                        Name = "Garmin Fenix 7 Pro Solar Sapphire",
                        Price = 899.99m,
                        Description = "Multisport GPS smartwatch with solar charging lens, LED flashlight, endurance score, and advanced training metrics.",
                        Image = "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80",
                        Rating = 4.8,
                        StockQuantity = 25,
                        CategoryId = watchCat.Id,
                        CategoryName = watchCat.Name
                    },

                    // Accessories
                    new Product
                    {
                        Name = "Anker Prime 100W GaN 3-Port Wall Charger",
                        Price = 79.99m,
                        Description = "GaNPrime ultra-compact fast charger capable of charging a MacBook Pro, iPad, and iPhone simultaneously at peak speeds.",
                        Image = "https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80",
                        Rating = 4.9,
                        StockQuantity = 120,
                        CategoryId = accCat.Id,
                        CategoryName = accCat.Name
                    },
                    new Product
                    {
                        Name = "MagSafe 3-in-1 Wireless Charging Stand",
                        Price = 129.99m,
                        Description = "Fast 15W wireless charging stand for iPhone, Apple Watch Ultra, and AirPods with premium weighted stainless steel base.",
                        Image = "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&auto=format&fit=crop&q=80",
                        Rating = 4.7,
                        StockQuantity = 75,
                        CategoryId = accCat.Id,
                        CategoryName = accCat.Name
                    }
                };

                context.Products.AddRange(products);
                await context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DbInitializer] Error during initialization: {ex.Message}");
        }
    }
}
