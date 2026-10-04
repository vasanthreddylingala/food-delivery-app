package com.fooddelivery.service;

import com.fooddelivery.dto.PageResponse;
import com.fooddelivery.dto.RestaurantRequest;
import com.fooddelivery.dto.RestaurantResponse;
import com.fooddelivery.entity.Restaurant;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.repository.RestaurantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RestaurantService {

    private static final Logger logger = LoggerFactory.getLogger(RestaurantService.class);

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Cacheable(value = "restaurants", key = "#search + '-' + #page + '-' + #size")
    @Transactional(readOnly = true)
    public PageResponse<RestaurantResponse> getAllRestaurants(String search, int page, int size) {
        logger.info("Fetching restaurants from DB (Cache MISS) for search='{}', page={}, size={}", search, page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        Page<Restaurant> restaurantPage;

        if (search != null && !search.trim().isEmpty()) {
            restaurantPage = restaurantRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                    search.trim(), search.trim(), pageable);
        } else {
            restaurantPage = restaurantRepository.findAll(pageable);
        }

        List<RestaurantResponse> dtoList = restaurantPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(
                dtoList,
                restaurantPage.getNumber(),
                restaurantPage.getSize(),
                restaurantPage.getTotalElements(),
                restaurantPage.getTotalPages(),
                restaurantPage.isLast()
        );
    }

    @Cacheable(value = "restaurant", key = "#id")
    @Transactional(readOnly = true)
    public RestaurantResponse getRestaurantById(Long id) {
        logger.info("Fetching restaurant ID {} from DB (Cache MISS)", id);
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));
        return mapToResponse(restaurant);
    }

    @Caching(evict = {
            @CacheEvict(value = "restaurants", allEntries = true)
    })
    @Transactional
    public RestaurantResponse createRestaurant(RestaurantRequest request) {
        logger.info("Creating new restaurant: {}. Evicting 'restaurants' cache.", request.getName());
        Restaurant restaurant = new Restaurant(
                request.getName(),
                request.getDescription(),
                request.getAddress(),
                request.getPhone(),
                request.getImageUrl()
        );

        Restaurant saved = restaurantRepository.save(restaurant);
        return mapToResponse(saved);
    }

    @Caching(evict = {
            @CacheEvict(value = "restaurants", allEntries = true),
            @CacheEvict(value = "restaurant", key = "#id")
    })
    @Transactional
    public RestaurantResponse updateRestaurant(Long id, RestaurantRequest request) {
        logger.info("Updating restaurant ID {}. Evicting cache.", id);
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));

        restaurant.setName(request.getName());
        restaurant.setDescription(request.getDescription());
        restaurant.setAddress(request.getAddress());
        restaurant.setPhone(request.getPhone());
        if (request.getImageUrl() != null && !request.getImageUrl().trim().isEmpty()) {
            restaurant.setImageUrl(request.getImageUrl());
        }

        Restaurant updated = restaurantRepository.save(restaurant);
        return mapToResponse(updated);
    }

    @Caching(evict = {
            @CacheEvict(value = "restaurants", allEntries = true),
            @CacheEvict(value = "restaurant", key = "#id"),
            @CacheEvict(value = "menus", key = "#id")
    })
    @Transactional
    public void deleteRestaurant(Long id) {
        logger.info("Deleting restaurant ID {}. Evicting cache.", id);
        if (!restaurantRepository.existsById(id)) {
            throw new ResourceNotFoundException("Restaurant not found with id: " + id);
        }
        restaurantRepository.deleteById(id);
    }

    public RestaurantResponse mapToResponse(Restaurant restaurant) {
        return new RestaurantResponse(
                restaurant.getId(),
                restaurant.getName(),
                restaurant.getDescription(),
                restaurant.getAddress(),
                restaurant.getPhone(),
                restaurant.getImageUrl(),
                restaurant.getCreatedAt()
        );
    }
}
