package com.fooddelivery.config;

import com.fooddelivery.entity.*;
import com.fooddelivery.repository.MenuItemRepository;
import com.fooddelivery.repository.RestaurantRepository;
import com.fooddelivery.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            logger.info("Seeding initial users...");

            User admin = new User("System Admin", "admin@food.local", passwordEncoder.encode("admin123"), Role.ROLE_ADMIN);
            User restaurantOwner = new User("Chef Mario", "restaurant@food.local", passwordEncoder.encode("restaurant123"), Role.ROLE_RESTAURANT);
            User customer = new User("John Doe", "customer@food.local", passwordEncoder.encode("customer123"), Role.ROLE_CUSTOMER);

            userRepository.saveAll(List.of(admin, restaurantOwner, customer));
        }

        if (restaurantRepository.count() == 0) {
            logger.info("Seeding initial restaurants and menu items...");

            Restaurant r1 = new Restaurant(
                    "Bella Italia Pizzeria",
                    "Authentic stone-baked Neapolitan pizza and artisan hand-rolled pasta.",
                    "124 Market St, Downtown",
                    "+1 (555) 234-5678",
                    "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80"
            );

            Restaurant r2 = new Restaurant(
                    "The Burger Craft",
                    "Juicy smash burgers made with 100% Angus beef, golden crinkle fries, and thick shakes.",
                    "45 Sunset Blvd, Westside",
                    "+1 (555) 345-6789",
                    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80"
            );

            Restaurant r3 = new Restaurant(
                    "Golden Dragon Bistro",
                    "Fresh wok-tossed noodles, steamed dumplings, and classic Sichuan specialties.",
                    "88 Chinatown Plaza",
                    "+1 (555) 456-7890",
                    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80"
            );

            Restaurant r4 = new Restaurant(
                    "Spice Route Kitchen",
                    "Rich slow-cooked curries, fragrant basmati biryanis, and tandoor-baked naan.",
                    "74 Curry Lane, Midtown",
                    "+1 (555) 567-8901",
                    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80"
            );

            restaurantRepository.saveAll(List.of(r1, r2, r3, r4));

            // Menu for Bella Italia
            menuItemRepository.saveAll(List.of(
                    new MenuItem(r1, "Margherita D.O.P.", "San Marzano tomatoes, fresh buffalo mozzarella, fresh basil, and extra virgin olive oil.", new BigDecimal("14.99"), "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80", true),
                    new MenuItem(r1, "Spicy Diavola", "Spicy Calabrian salami, mozzarella, chili flakes, and organic honey drizzle.", new BigDecimal("16.50"), "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80", true),
                    new MenuItem(r1, "Truffle Tagliatelle", "Handmade egg pasta tossed in creamy black truffle butter sauce and aged parmesan.", new BigDecimal("18.00"), "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80", true),
                    new MenuItem(r1, "Classic Tiramisu", "Espresso-soaked ladyfingers with mascarpone cream and dusted cocoa.", new BigDecimal("7.50"), "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80", true)
            ));

            // Menu for The Burger Craft
            menuItemRepository.saveAll(List.of(
                    new MenuItem(r2, "The Classic Double Smash", "Two seared Angus patties, American cheddar, secret house sauce, pickles on brioche.", new BigDecimal("12.99"), "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80", true),
                    new MenuItem(r2, "Bacon Jam BBQ Burger", "Crispy bacon, smoky barbecue glaze, aged gouda, and beer-battered onion ring.", new BigDecimal("14.50"), "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=600&q=80", true),
                    new MenuItem(r2, "Truffle Parmesan Fries", "Crispy hand-cut fries tossed with white truffle oil, sea salt, and parmesan.", new BigDecimal("6.00"), "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80", true),
                    new MenuItem(r2, "Salted Caramel Shake", "Thick churned vanilla bean gelato with homemade sea-salted caramel ribbon.", new BigDecimal("5.50"), "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80", true)
            ));

            // Menu for Golden Dragon Bistro
            menuItemRepository.saveAll(List.of(
                    new MenuItem(r3, "Steamed Pork Xiao Long Bao", "Soup dumplings filled with seasoned Kurobuta pork and rich aromatic broth (6 pcs).", new BigDecimal("11.50"), "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80", true),
                    new MenuItem(r3, "Sichuan Dan Dan Noodles", "Springy egg noodles in spicy chili-sesame sauce topped with minced pork and scallions.", new BigDecimal("13.00"), "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80", true),
                    new MenuItem(r3, "Kung Pao Crispy Chicken", "Tender chicken wok-fried with roasted peanuts, dried red chilies, and scallions.", new BigDecimal("15.00"), "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80", true)
            ));

            // Menu for Spice Route Kitchen
            menuItemRepository.saveAll(List.of(
                    new MenuItem(r4, "Butter Chicken (Murgh Makhani)", "Tender tandoori chicken simmered in rich creamy tomato and fenugreek gravy.", new BigDecimal("16.00"), "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80", true),
                    new MenuItem(r4, "Hyderabadi Dum Biryani", "Layered basmati rice and spiced marinated chicken cooked under dum with saffron.", new BigDecimal("15.50"), "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80", true),
                    new MenuItem(r4, "Garlic Butter Naan", "Fresh clay oven baked flatbread brushed with roasted garlic and melted butter.", new BigDecimal("3.50"), "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80", true)
            ));

            logger.info("Sample database seeding completed successfully.");
        }
    }
}
