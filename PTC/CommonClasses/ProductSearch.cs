using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PTC
{
  public class ProductSearch
  {
    public string ProductName { get; set; }
    public int CategoryId { get; set; }
    public decimal Price { get; set; }
    public decimal MinPrice { get; set; }
    public decimal MaxPrice { get; set; }
    }
}