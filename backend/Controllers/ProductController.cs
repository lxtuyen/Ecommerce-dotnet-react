using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;
using backend.DTOs.Product;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Controllers;

[ApiController]
[Route("api/v1/[controller]s")]
public class ProductController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<ActionResult<ServiceResponse<List<GetProductDTO>>>> GetAllProducts()
    {
        var response = await _productService.GetAllProducts();
        return Ok(response);
    }

    [HttpGet("sort-by")]
    public async Task<ActionResult<ServiceResponse<List<GetProductDTO>>>> GetAllProductsSort([FromQuery] string sortBy)
    {
        var response = await _productService.GetAllProductsSort(sortBy);
        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceResponse<GetProductDTO>>> GetSingle(int id)
    {
        var response = await _productService.GetProductById(id);
        if (response.Data is null)
        {
            return NotFound(response);
        }
        return Ok(response);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ServiceResponse<List<AddProductDTO>>>> AddProduct([FromBody] GetProductDTO newProduct)
    {
        var response = await _productService.AddProduct(newProduct);
        return Ok(response);
    }

    [HttpPut]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ServiceResponse<List<GetProductDTO>>>> UpdateProduct([FromBody] UpdateProductDTO updatedProduct)
    {
        var response = await _productService.UpdateProduct(updatedProduct);
        if (response.Data is null)
        {
            return NotFound(response);
        }
        return Ok(response);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ServiceResponse<GetProductDTO>>> DeleteProduct(int id)
    {
        var response = await _productService.DeleteProduct(id);
        if (response.Data is null)
        {
            return NotFound(response);
        }
        return Ok(response);
    }

    [HttpGet("{categoryId}/products")]
    public async Task<ActionResult<ServiceResponse<List<GetProductDTO>>>> GetProductsByCategory(int categoryId)
    {
        var response = await _productService.GetProductsByCategory(categoryId);
        return Ok(response);
    }

    [HttpGet("pagination")]
    public async Task<ActionResult<ServiceResponse<List<GetProductDTO>>>> Pagination([FromQuery] int pageNumber, [FromQuery] int pageSize)
    {
        var response = await _productService.Pagination(pageNumber, pageSize);
        return Ok(response);
    }
}
