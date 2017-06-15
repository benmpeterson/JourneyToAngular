using PTC.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Validation;
using System.Linq;
using System.Web.Mvc;

namespace PTC
{
  public class PTCViewModel
  {
    #region Constructor
    public PTCViewModel() {
      Init();
    }
    #endregion

    #region Public Properties
    public List<Product> Products { get; set; }
    public List<Product> ProductsMaxPrice { get; set; }
    public List<Product> ProductsMinPrice { get; set; }
    public List<Category> Categories { get; set; }
    public ProductSearch SearchEntity { get; set; }
    public List<Category> SearchCategories { get; set; }
    public Product Entity { get; set; }

    public string EventCommand { get; set; }
    public string EventArgument { get; set; }
    public bool IsValid { get; set; }
    public string PageMode { get; set; }
    public bool IsDetailAreaVisible { get; set; }
    public bool IsListAreaVisible { get; set; }
    public bool IsSearchAreaVisible { get; set; }
    public ModelStateDictionary Messages { get; set; }
    #endregion

    #region Init Method
    public void Init() {
      Products = new List<Product>();
      ProductsMaxPrice = new List<Product>();
      ProductsMaxPrice = new List<Product>();
      Categories = new List<Category>();
      Entity = new Product();

      SearchEntity = new ProductSearch();
      SearchCategories = new List<Category>();

      EventCommand = string.Empty;
      EventArgument = string.Empty;
      IsValid = true;
      IsDetailAreaVisible = false;
      IsListAreaVisible = true;
      IsSearchAreaVisible = true;
      PageMode = PageConstants.LIST;
      Messages = new ModelStateDictionary();
    }
    #endregion

    #region HandleRequest Method
    public void HandleRequest() {

      //this is now handled client side
      //LoadSearchCategories();

      LoadCategories();

      switch (EventCommand.ToLower()) {
        case "":
        case "list":
          Get();
          break;

        case "search":
          Search();
          break;

        case "resetsearch":
          ResetSearch();
          break;

        case "cancel":
          Get();
          break;

        case "add":
          AddMode();
          break;

        case "edit":
          EditMode(Convert.ToInt32(EventArgument));
          break;

        case "save":
          Save();
          break;

        case "delete":
          Delete(Convert.ToInt32(EventArgument));
          break;

        default:
          break;
      }
    }
    #endregion

    #region LoadCategories Method
    public void LoadCategories() {
      PTCEntities db = new PTCEntities();

      // Load categories
      Categories.AddRange(db.Categories);
    }
    #endregion

    #region LoadSearchCategories Method
    public void LoadSearchCategories() {
      PTCEntities db = new PTCEntities();

      if (Categories.Count == 0) {
        // Load categories
        SearchCategories.AddRange(db.Categories);
      }
      else {
        SearchCategories.AddRange(Categories);
      }

      // Add category for 'Search All'
      Category entity = new Category();
      entity.CategoryId = 0;
      entity.CategoryName = "-- Search All Makes --";
      SearchCategories.AddRange(Categories);
      // Insert "Search" at the top
      SearchCategories.Insert(0, entity);
    }
    #endregion

    #region Get Methods
    public void Get() {
      PTCEntities db = new PTCEntities();

      Products = db.Products.OrderBy(p => p.ProductName).ToList();

      SetUIState(PageConstants.LIST);
    }

    public Product Get(int productId) {
      PTCEntities db = new PTCEntities();

      Entity = db.Products.Find(productId);

      return Entity;
    }
    #endregion

    
    public void Search()
        {
            PTCEntities db = new PTCEntities();

            // Perform Search
            GetProductMake(db);

            SetUIState(PageConstants.LIST);
        }

        public void SearchPrice()
        {
            PTCEntities db = new PTCEntities();

            GetMaxPrice(db);
            GetMinPrice(db);


            SetUIState(PageConstants.LIST);
        }

        public void SearchPriceAndMake()
        {
            PTCEntities db = new PTCEntities();

            // Perform Search
            GetProductMake(db);
            GetMaxPrice(db);
            GetMinPrice(db);

            SetUIState(PageConstants.LIST);
        }

        private void GetProductMake(PTCEntities db)
        {
            Products = db.Products.Where(p =>
                    (SearchEntity.CategoryId == 0 ? true :
                         p.Category.CategoryId == SearchEntity.CategoryId) &&
                    (string.IsNullOrEmpty(SearchEntity.ProductName) ? true :
                         p.ProductName.Contains(SearchEntity.ProductName))).
                    OrderBy(p => p.ProductName).ToList();
        }

        private void GetMinPrice(PTCEntities db)
        {
            ProductsMinPrice = db.Products.Where(p =>
                            (SearchEntity.MinPrice) <= (p.Price))
                            .OrderBy(p => p.Price).ToList();
        }

        private void GetMaxPrice(PTCEntities db)
        {
            ProductsMaxPrice = db.Products.Where(p =>
                        (SearchEntity.MaxPrice) >= (p.Price))
                        .OrderBy(p => p.Price).ToList();
        }
                
        public void ResetSearch() {
        SearchEntity = new ProductSearch();

        Get();
        }
   

    #region AddMode Method
    public void AddMode() {
      // Initialize Entity Object
      Entity = new Product();
      Entity.IntroductionDate = DateTime.Now;
      Entity.Url = string.Empty;
      Entity.Price = 0;

      SetUIState(PageConstants.ADD);
    }
    #endregion

    #region EditMode Method
    public void EditMode(int productId) {
      // Get Product Data
      Entity = Get(productId);

      SetUIState(PageConstants.EDIT);
    }
    #endregion

    #region SetUIState Method
    protected void SetUIState(string state) {
      PageMode = state;

      IsDetailAreaVisible = (PageMode == "Add" || PageMode == "Edit");
      IsListAreaVisible = (PageMode == "List");
      IsSearchAreaVisible = (PageMode == "List");
    }
    #endregion

    #region Save Method
    public void Save() {
      Messages.Clear();

      PTCEntities db = new PTCEntities();

      // Ensure the correct category is set
      Entity.Category = db.Categories.Find(Entity.Category.CategoryId);

      try {
        // Either Update or Insert product
        if (PageMode == PageConstants.EDIT) {
          db.Entry(Entity).State = EntityState.Modified;
          db.SaveChanges();
        }
        else if (PageMode == PageConstants.ADD) {
          db.Products.Add(Entity);
          db.SaveChanges();
        }

        // Get all the data again in case anything changed
        Get();
      }
      catch (DbEntityValidationException ex) {
        IsValid = false;
        // Validation errors
        foreach (var errors in ex.EntityValidationErrors) {
          foreach (var item in errors.ValidationErrors) {
            Messages.AddModelError(item.PropertyName, item.ErrorMessage);
          }
        }

        // Set page state
        SetUIState(PageMode);
      }
    }
    #endregion

    #region Delete Method
    public void Delete(int productId) {
      PTCEntities db = new PTCEntities();

      Product product = db.Products.Find(productId);

      db.Products.Remove(product);

      db.SaveChanges();

      Get();
    }
    #endregion
  }
}
