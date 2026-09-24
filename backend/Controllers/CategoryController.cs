using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.DTOs.Category;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Controllers;

[ApiController]
[Route("api/v1/Categories")]
public class CategoryController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoryController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<ServiceResponse<List<GetCategoryDTO>>>> GetAll()
    {
        var response = await _categoryService.GetAllCategories();
        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceResponse<GetCategoryDTO>>> GetSingle(int id)
    {
        var response = await _categoryService.GetCategoryById(id);
        if (response.Data is null)
        {
            return NotFound(response);
        }
        return Ok(response);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ServiceResponse<List<AddCategoryDTO>>>> AddCategory([FromBody] GetCategoryDTO newCategory)
    {
        var response = await _categoryService.AddCategory(newCategory);
        return Ok(response);
    }

    [HttpPut]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ServiceResponse<List<GetCategoryDTO>>>> UpdateCategory([FromBody] UpdateCategoryDTO updatedCategory)
    {
        var response = await _categoryService.UpdateCategory(updatedCategory);
        if (response.Data is null)
        {
            return NotFound(response);
        }
        return Ok(response);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ServiceResponse<GetCategoryDTO>>> DeleteCategory(int id)
    {
        var response = await _categoryService.DeleteCategory(id);
        if (response.Data is null)
        {
            return NotFound(response);
        }
        return Ok(response);
    }
}