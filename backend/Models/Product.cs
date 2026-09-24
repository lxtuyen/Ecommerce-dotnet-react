using System;
using System.Collections.Generic;

namespace backend.Models;

public class Product : BaseModel
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public double Rating { get; set; } = 4.8;
    public int StockQuantity { get; set; } = 50;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public Category? Category { get; set; }
}
