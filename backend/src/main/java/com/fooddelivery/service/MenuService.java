package com.fooddelivery.service;

import com.fooddelivery.dto.MenuItemRequest;
import com.fooddelivery.dto.MenuItemResponse;
import com.fooddelivery.entity.MenuItem;
import com.fooddelivery.entity.Restaurant;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.repository.MenuItemRepository;
import com.fooddelivery.repository.RestaurantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MenuService {

    private static final Logger logger = LoggerFactory.getLogger(MenuService.class);

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Cacheable(value = "menus", key = "#restaurantId")
    @Transactional(readOnly = true)
    public List<MenuItemResponse> getMenuByRestaurant(Long restaurantId) {
        logger.info("Fetching menu for restaurant ID {} from DB (Cache MISS)", restaurantId);
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new ResourceNotFoundException("Restaurant not found with id: " + restaurantId);
        }

        List<MenuItem> items = menuItemRepository.findByRestaurantId(restaurantId);
        return items.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @CacheEvict(value = "menus", key = "#restaurantId")
    @Transactional
    public MenuItemResponse addMenuItem(Long restaurantId, MenuItemRequest request) {
        logger.info("Adding menu item to restaurant ID {}. Evicting 'menus' cache.", restaurantId);
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + restaurantId));

        MenuItem menuItem = new MenuItem(
                restaurant,
                request.getName(),
                request.getDescription(),
                request.getPrice(),
                request.getImageUrl(),
                request.getAvailable()
        );

        MenuItem saved = menuItemRepository.save(menuItem);
        return mapToResponse(saved);
    }

    @Transactional
    public MenuItemResponse updateMenuItem(Long id, MenuItemRequest request) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));

        logger.info("Updating menu item ID {}. Evicting 'menus' cache for restaurant {}.", id, menuItem.getRestaurant().getId());

        menuItem.setName(request.getName());
        menuItem.setDescription(request.getDescription());
        menuItem.setPrice(request.getPrice());
        if (request.getImageUrl() != null && !request.getImageUrl().trim().isEmpty()) {
            menuItem.setImageUrl(request.getImageUrl());
        }
        if (request.getAvailable() != null) {
            menuItem.setAvailable(request.getAvailable());
        }

        MenuItem updated = menuItemRepository.save(menuItem);
        evictMenuCache(menuItem.getRestaurant().getId());
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteMenuItem(Long id) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));

        Long restaurantId = menuItem.getRestaurant().getId();
        logger.info("Deleting menu item ID {}. Evicting 'menus' cache for restaurant {}.", id, restaurantId);

        menuItemRepository.delete(menuItem);
        evictMenuCache(restaurantId);
    }

    @CacheEvict(value = "menus", key = "#restaurantId")
    public void evictMenuCache(Long restaurantId) {
        logger.debug("Evicted cache for restaurant menu ID {}", restaurantId);
    }

    public MenuItemResponse mapToResponse(MenuItem item) {
        return new MenuItemResponse(
                item.getId(),
                item.getRestaurant().getId(),
                item.getName(),
                item.getDescription(),
                item.getPrice(),
                item.getImageUrl(),
                item.getAvailable(),
                item.getCreatedAt()
        );
    }
}
