using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using System.Collections.Generic;
using System.Linq;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();
app.UseCors("AllowAll");

var tours = new List<Tour>
{
    new Tour { 
        Id = 1, Title = "Възстановяване на Южната стена", Guide = "Александър", AvatarUrl = "https://ui-avatars.com/api/?name=Alexander&background=9C27B0&color=fff", 
        Cause = "Почистване на историческата зона от растителност, която руши камъка.", Category = "Култура", 
        Tags = new[] { "Физически труд", "История" }, Time = "08.06.2026, 10:00 ч.", Scope = "3 часа", 
        Lat = 42.6578, Lng = 27.7345, MaxSpots = 10, CurrentSpots = 4 
    },
    new Tour { 
        Id = 2, Title = "Еко Патрул: Южен Плаж", Guide = "Мария", AvatarUrl = "https://ui-avatars.com/api/?name=Maria&background=4CAF50&color=fff", 
        Cause = "Масово събиране на пластмаса и отпадъци след бурята. Осигурени са чували и ръкавици.", Category = "Екология", 
        Tags = new[] { "Почистване", "Природа" }, Time = "09.06.2026, 08:30 ч.", Scope = "4 часа", 
        Lat = 42.6512, Lng = 27.7145, MaxSpots = 20, CurrentSpots = 19 
    },
    new Tour { 
        Id = 3, Title = "Картографиране на опасни шахти", Guide = "Никола", AvatarUrl = "https://ui-avatars.com/api/?name=Nikola&background=FF9800&color=fff", 
        Cause = "Обиколка на новия град за локализиране и снимане на разбити тротоари и открити шахти.", Category = "Инфраструктура", 
        Tags = new[] { "Градска среда", "Одит" }, Time = "10.06.2026, 14:00 ч.", Scope = "2 часа", 
        Lat = 42.6593, Lng = 27.7160, MaxSpots = 5, CurrentSpots = 2 
    },
    new Tour { 
        Id = 4, Title = "Спасяване на дюните", Guide = "Владимир", AvatarUrl = "https://ui-avatars.com/api/?name=Vladimir&background=4CAF50&color=fff", 
        Cause = "Премахване на незаконни заграждения върху защитените пясъчни дюни.", Category = "Екология", 
        Tags = new[] { "Физически труд", "Природа" }, Time = "12.06.2026, 09:00 ч.", Scope = "5 часа", 
        Lat = 42.6480, Lng = 27.7100, MaxSpots = 15, CurrentSpots = 15 
    }
};

app.MapGet("/api/tours", () => Results.Ok(tours));

app.MapPost("/api/tours/{id}/join", (int id) =>
{
    var tour = tours.FirstOrDefault(t => t.Id == id);
    if (tour == null) return Results.NotFound();
    if (tour.CurrentSpots >= tour.MaxSpots) return Results.BadRequest("Обявата е запълнена.");
    tour.CurrentSpots++;
    return Results.Ok(tour);
});

app.MapPost("/api/tours", (Tour newTour) =>
{
    newTour.Id = tours.Count == 0 ? 1 : tours.Max(t => t.Id) + 1;
    tours.Add(newTour);
    return Results.Ok(newTour);
});

app.Run();

public class Tour { 
    public int Id { get; set; } 
    public string Title { get; set; } 
    public string Guide { get; set; } 
    public string AvatarUrl { get; set; } 
    public string Cause { get; set; } 
    public string Category { get; set; } 
    public string[] Tags { get; set; }
    public string Time { get; set; }
    public string Scope { get; set; }
    public double Lat { get; set; } 
    public double Lng { get; set; } 
    public int MaxSpots { get; set; } 
    public int CurrentSpots { get; set; } 
}