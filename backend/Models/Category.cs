using System.Collections.Generic;

namespace backend.Models;

public class Category : BaseModel
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Image { get; set; }
    public string? Icon { get; set; }
    public List<Product> Products { get; set; } = new();
}