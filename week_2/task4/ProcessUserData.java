import java.util.*;
import java.util.regex.Pattern;

/**
 * Utility class for processing user data.
 */
public class ProcessUserData {
    /**
     * Processes a list of user data maps, validating emails and ages, and returns a list of results.
     *
     * @param users List of user data maps (each map should contain keys like "email", "first_name", "last_name", "age")
     * @return List of result maps with validation status and details
     */
    public static List<Map<String, Object>> processUserData(List<Map<String, Object>> users) {
        List<Map<String, Object>> results = new ArrayList<>();
        Pattern emailPattern = Pattern.compile("[^@]+@[^@]+\\.[^@]+", Pattern.CASE_INSENSITIVE);
        for (Map<String, Object> user : users) {
            try {
                Object emailObj = user.get("email");
                String email = emailObj instanceof String ? (String) emailObj : null;
                if (email == null || !emailPattern.matcher(email).matches()) {
                    throw new IllegalArgumentException("Invalid email");
                }
                int age = 0;
                Object ageObj = user.get("age");
                if (ageObj instanceof Number) {
                    age = ((Number) ageObj).intValue();
                } else if (ageObj instanceof String) {
                    try {
                        age = Integer.parseInt((String) ageObj);
                    } catch (NumberFormatException ignored) {}
                }
                if (age < 18) {
                    throw new IllegalArgumentException("User must be 18+");
                }
                String firstName = user.getOrDefault("first_name", "").toString();
                String lastName = user.getOrDefault("last_name", "").toString();
                String fullName = (firstName + " " + lastName).trim();
                Map<String, Object> result = new HashMap<>();
                result.put("email", email);
                result.put("full_name", capitalizeWords(fullName));
                result.put("is_valid", true);
                results.add(result);
            } catch (Exception e) {
                Map<String, Object> errorResult = new HashMap<>();
                errorResult.put("email", user.getOrDefault("email", "N/A"));
                errorResult.put("error", e.getMessage());
                errorResult.put("is_valid", false);
                results.add(errorResult);
            }
        }
        return results;
    }

    /**
     * Capitalizes the first letter of each word in a string.
     * @param input The input string
     * @return The capitalized string
     */
    private static String capitalizeWords(String input) {
        if (input == null || input.isEmpty()) return input;
        String[] words = input.split(" ");
        StringBuilder sb = new StringBuilder();
        for (String word : words) {
            if (!word.isEmpty()) {
                sb.append(Character.toUpperCase(word.charAt(0)));
                if (word.length() > 1) {
                    sb.append(word.substring(1).toLowerCase());
                }
                sb.append(" ");
            }
        }
        return sb.toString().trim();
    }
} 