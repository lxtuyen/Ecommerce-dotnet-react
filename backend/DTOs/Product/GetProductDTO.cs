using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models;

namespace backend.DTOs.Product;

public class GetProductDTO
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public decimal? Price { get; set; }
    public string? Description { get; set; }
    public string? Image { get; set; }
    public double Rating { get; set; } = 4.8;
    public int ReviewCount { get; set; } = 0;
    public int StockQuantity { get; set; } = 50;
    public int CategoryId { get; set; }
    public string? CategoryName { get; set; }
}