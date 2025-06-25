import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

public class ProcessUserDataTest {
    @Test
    public void testValidUser() {
        Map<String, Object> user = new HashMap<>();
        user.put("email", "john.doe@example.com");
        user.put("first_name", "john");
        user.put("last_name", "doe");
        user.put("age", 25);
        List<Map<String, Object>> users = Collections.singletonList(user);
        List<Map<String, Object>> results = ProcessUserData.processUserData(users);
        assertEquals(1, results.size());
        Map<String, Object> result = results.get(0);
        assertEquals("john.doe@example.com", result.get("email"));
        assertEquals("John Doe", result.get("full_name"));
        assertEquals(true, result.get("is_valid"));
    }

    @Test
    public void testInvalidEmail() {
        Map<String, Object> user = new HashMap<>();
        user.put("email", "invalid-email");
        user.put("first_name", "jane");
        user.put("last_name", "doe");
        user.put("age", 30);
        List<Map<String, Object>> users = Collections.singletonList(user);
        List<Map<String, Object>> results = ProcessUserData.processUserData(users);
        assertEquals(1, results.size());
        Map<String, Object> result = results.get(0);
        assertEquals("invalid-email", result.get("email"));
        assertEquals(false, result.get("is_valid"));
        assertTrue(result.get("error").toString().contains("Invalid email"));
    }

    @Test
    public void testUnderageUser() {
        Map<String, Object> user = new HashMap<>();
        user.put("email", "jane.doe@example.com");
        user.put("first_name", "jane");
        user.put("last_name", "doe");
        user.put("age", 16);
        List<Map<String, Object>> users = Collections.singletonList(user);
        List<Map<String, Object>> results = ProcessUserData.processUserData(users);
        assertEquals(1, results.size());
        Map<String, Object> result = results.get(0);
        assertEquals("jane.doe@example.com", result.get("email"));
        assertEquals(false, result.get("is_valid"));
        assertTrue(result.get("error").toString().contains("User must be 18+"));
    }

    @Test
    public void testMissingEmail() {
        Map<String, Object> user = new HashMap<>();
        user.put("first_name", "no");
        user.put("last_name", "email");
        user.put("age", 22);
        List<Map<String, Object>> users = Collections.singletonList(user);
        List<Map<String, Object>> results = ProcessUserData.processUserData(users);
        assertEquals(1, results.size());
        Map<String, Object> result = results.get(0);
        assertEquals("N/A", result.get("email"));
        assertEquals(false, result.get("is_valid"));
        assertTrue(result.get("error").toString().contains("Invalid email"));
    }

    @Test
    public void testMultipleUsers() {
        Map<String, Object> user1 = new HashMap<>();
        user1.put("email", "a@example.com");
        user1.put("first_name", "a");
        user1.put("last_name", "b");
        user1.put("age", 20);
        Map<String, Object> user2 = new HashMap<>();
        user2.put("email", "bad");
        user2.put("first_name", "bad");
        user2.put("last_name", "user");
        user2.put("age", 30);
        List<Map<String, Object>> users = Arrays.asList(user1, user2);
        List<Map<String, Object>> results = ProcessUserData.processUserData(users);
        assertEquals(2, results.size());
        assertEquals(true, results.get(0).get("is_valid"));
        assertEquals(false, results.get(1).get("is_valid"));
    }
} 