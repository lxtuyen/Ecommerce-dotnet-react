using System;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Address;

public class AddressDTO
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string AddressLine { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public string Label { get; set; } = "Home";
    public bool IsDefault { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateAddressDTO
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(25)]
    public string Phone { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string AddressLine { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string City { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string ZipCode { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Label { get; set; } = "Home";

    public bool IsDefault { get; set; } = false;
}
