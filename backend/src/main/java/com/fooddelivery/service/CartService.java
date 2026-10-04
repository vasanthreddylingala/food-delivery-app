package com.fooddelivery.service;

import com.fooddelivery.dto.CartItemRequest;
import com.fooddelivery.dto.CartItemResponse;
import com.fooddelivery.dto.CartResponse;
import com.fooddelivery.entity.Cart;
import com.fooddelivery.entity.CartItem;
import com.fooddelivery.entity.MenuItem;
import com.fooddelivery.entity.User;
import com.fooddelivery.exception.BadRequestException;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.repository.CartItemRepository;
import com.fooddelivery.repository.CartRepository;
import com.fooddelivery.repository.MenuItemRepository;
import com.fooddelivery.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Transactional
    public Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                    Cart cart = new Cart(user);
                    return cartRepository.save(cart);
                });
    }

    @Transactional(readOnly = true)
    public CartResponse getCartDto(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return mapToCartResponse(cart);
    }

    @Transactional
    public CartResponse addToCart(Long userId, CartItemRequest request) {
        Cart cart = getOrCreateCart(userId);

        MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + request.getMenuItemId()));

        if (!Boolean.TRUE.equals(menuItem.getAvailable())) {
            throw new BadRequestException("Menu item is currently unavailable");
        }

        // If cart has items from another restaurant, prompt clear or verify
        if (!cart.getItems().isEmpty()) {
            Long currentRestaurantId = cart.getItems().get(0).getMenuItem().getRestaurant().getId();
            if (!currentRestaurantId.equals(menuItem.getRestaurant().getId())) {
                // Auto-clear or reset cart for new restaurant
                cart.getItems().clear();
                cartRepository.save(cart);
            }
        }

        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndMenuItemId(cart.getId(), menuItem.getId());
        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepository.save(item);
        } else {
            CartItem newItem = new CartItem(cart, menuItem, request.getQuantity());
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        return getCartDto(userId);
    }

    @Transactional
    public CartResponse updateCartItemQuantity(Long userId, Long cartItemId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to user cart");
        }

        if (quantity <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return getCartDto(userId);
    }

    @Transactional
    public CartResponse removeCartItem(Long userId, Long cartItemId) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to user cart");
        }

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        return getCartDto(userId);
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private CartResponse mapToCartResponse(Cart cart) {
        List<CartItemResponse> itemResponses = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        int totalItemsCount = 0;

        for (CartItem item : cart.getItems()) {
            BigDecimal subtotal = item.getMenuItem().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            total = total.add(subtotal);
            totalItemsCount += item.getQuantity();

            itemResponses.add(new CartItemResponse(
                    item.getId(),
                    item.getMenuItem().getId(),
                    item.getMenuItem().getRestaurant().getId(),
                    item.getMenuItem().getRestaurant().getName(),
                    item.getMenuItem().getName(),
                    item.getMenuItem().getPrice(),
                    item.getMenuItem().getImageUrl(),
                    item.getQuantity(),
                    subtotal
            ));
        }

        return new CartResponse(cart.getId(), itemResponses, total, totalItemsCount);
    }
}
