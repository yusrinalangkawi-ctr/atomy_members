/**
 * ==============================================================================
 * SISTEM PENGURUSAN KEAHLIAN (MEMBER MANAGEMENT SYSTEM) - JAVA HTTP SERVER
 * Fail: MemberServer.java
 * Keperluan: Java SE 8, 11, 17, 21+ (Menggunakan library standard Java sahaja)
 * Cara Menjalankan:
 *   1. Kompil: javac MemberServer.java
 *   2. Jalankan: java MemberServer
 *   3. Buka Pelayar: http://localhost:8080
 * ==============================================================================
 */

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantLock;

public class MemberServer {

    private static final int PORT = 8080;
    private static final String DATA_FILE = "members_data.json";

    // Pangkalan Data Dalam Memori (Thread-safe)
    private static final List<Member> memberList = Collections.synchronizedList(new ArrayList<>());
    private static final AtomicInteger idCounter = new AtomicInteger(0);
    private static final ReentrantLock registrationLock = new ReentrantLock();

    public static void main(String[] args) throws IOException {
        loadDataFromFile();
        initDefaultMembersIfEmpty();

        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

        // 1. Static File Handlers (HTML, CSS, JS)
        server.createContext("/", new StaticFileHandler("index.html", "text/html; charset=utf-8"));
        server.createContext("/index.html", new StaticFileHandler("index.html", "text/html; charset=utf-8"));
        server.createContext("/style.css", new StaticFileHandler("style.css", "text/css; charset=utf-8"));
        server.createContext("/app.js", new StaticFileHandler("app.js", "application/javascript; charset=utf-8"));

        // 2. REST API Endpoints
        server.createContext("/api/members", new MembersApiHandler());
        server.createContext("/api/stats", new StatsApiHandler());
        server.createContext("/api/auth/login", new LoginApiHandler());

        server.setExecutor(null); // default executor
        System.out.println("=================================================");
        System.out.println("🚀 Pelayan Java Sistem Keahlian Telah Dilancarkan!");
        System.out.println("🌐 URL: http://localhost:" + PORT);
        System.out.println("📂 Menyajikan fail: index.html, style.css, app.js");
        System.out.println("=================================================");
        server.start();
    }

    // Model Rekod Ahli
    static class Member {
        String id;
        String memberId;
        String nama;
        String telefon;
        String nric;
        String email;
        String sponsorId;
        String alamat;
        String tarikhDaftar;
        String status;

        public Member(String id, String memberId, String nama, String telefon, String nric, String email, String sponsorId, String alamat, String tarikhDaftar, String status) {
            this.id = id;
            this.memberId = memberId;
            this.nama = nama;
            this.telefon = telefon;
            this.nric = nric;
            this.email = email;
            this.sponsorId = sponsorId;
            this.alamat = alamat;
            this.tarikhDaftar = tarikhDaftar;
            this.status = status;
        }

        public String toJson() {
            return String.format(
                "{\"id\":\"%s\",\"memberId\":\"%s\",\"nama\":\"%s\",\"telefon\":\"%s\",\"nric\":\"%s\",\"email\":\"%s\",\"sponsorId\":\"%s\",\"alamat\":\"%s\",\"tarikhDaftar\":\"%s\",\"status\":\"%s\"}",
                escapeJson(id), escapeJson(memberId), escapeJson(nama), escapeJson(telefon), escapeJson(nric),
                escapeJson(email != null ? email : ""), escapeJson(sponsorId != null ? sponsorId : "-"),
                escapeJson(alamat), escapeJson(tarikhDaftar), escapeJson(status)
            );
        }
    }

    // Handler Fail Statik (HTML, CSS, JS)
    static class StaticFileHandler implements HttpHandler {
        private final String fileName;
        private final String contentType;

        public StaticFileHandler(String fileName, String contentType) {
            this.fileName = fileName;
            this.contentType = contentType;
        }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            File file = new File(fileName);
            if (!file.exists()) {
                // Cuba cari dalam direktori java_html_css sekiranya dijalankan dari root
                file = new File("java_html_css/" + fileName);
            }

            if (file.exists()) {
                byte[] bytes = Files.readAllBytes(file.toPath());
                exchange.getResponseHeaders().set("Content-Type", contentType);
                exchange.sendResponseHeaders(200, bytes.length);
                OutputStream os = exchange.getResponseBody();
                os.write(bytes);
                os.close();
            } else {
                String notFound = "Fail " + fileName + " tidak ditemui.";
                exchange.sendResponseHeaders(404, notFound.length());
                OutputStream os = exchange.getResponseBody();
                os.write(notFound.getBytes(StandardCharsets.UTF_8));
                os.close();
            }
        }
    }

    // Handler REST API: /api/members (GET & POST)
    static class MembersApiHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                StringBuilder sb = new StringBuilder("{\"members\":[");
                synchronized (memberList) {
                    for (int i = 0; i < memberList.size(); i++) {
                        sb.append(memberList.get(i).toJson());
                        if (i < memberList.size() - 1) sb.append(",");
                    }
                }
                sb.append("]}");
                sendJsonResponse(exchange, 200, sb.toString());
                return;
            }

            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                registrationLock.lock();
                try {
                    String body = readRequestBody(exchange);
                    Map<String, String> map = parseJsonSimple(body);

                    String nama = map.getOrDefault("nama", "").trim();
                    String telefon = map.getOrDefault("telefon", "").trim();
                    String nric = map.getOrDefault("nric", "").trim();
                    String email = map.getOrDefault("email", "").trim();
                    String sponsorId = map.getOrDefault("sponsorId", "").trim().toUpperCase();
                    String alamat = map.getOrDefault("alamat", "").trim();

                    if (nama.isEmpty() || telefon.isEmpty() || nric.isEmpty()) {
                        sendJsonResponse(exchange, 400, "{\"error\":\"Nama, telefon dan NRIC wajib diisi.\"}");
                        return;
                    }

                    // Semakan duplikasi telefon & NRIC
                    String cleanNric = nric.replaceAll("\\D", "");
                    String cleanPhone = telefon.replaceAll("\\D", "");
                    synchronized (memberList) {
                        for (Member m : memberList) {
                            if (m.status.equals("ACTIVE")) {
                                if (m.nric.replaceAll("\\D", "").equals(cleanNric)) {
                                    sendJsonResponse(exchange, 400, "{\"error\":\"NRIC ini telah pun didaftarkan!\"}");
                                    return;
                                }
                                if (m.telefon.replaceAll("\\D", "").equals(cleanPhone)) {
                                    sendJsonResponse(exchange, 400, "{\"error\":\"No Telefon ini telah pun didaftarkan!\"}");
                                    return;
                                }
                            }
                        }
                    }

                    // Janaan Member ID berturutan atomik
                    int nextNum = idCounter.incrementAndGet();
                    String memberId = String.format("MBR-%06d", nextNum);
                    String now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"));

                    Member newMember = new Member(
                        "mbr_" + System.currentTimeMillis(),
                        memberId,
                        nama,
                        telefon,
                        cleanNric,
                        email,
                        sponsorId.isEmpty() ? "-" : sponsorId,
                        alamat,
                        now,
                        "ACTIVE"
                    );

                    memberList.add(0, newMember);
                    saveDataToFile();

                    sendJsonResponse(exchange, 201, "{\"success\":true,\"member\":" + newMember.toJson() + "}");
                } finally {
                    registrationLock.unlock();
                }
            }
        }
    }

    // Handler REST API: /api/stats (GET)
    static class StatsApiHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            int total = memberList.size();
            long active = memberList.stream().filter(m -> "ACTIVE".equals(m.status)).count();
            String json = String.format("{\"total\":%d,\"active\":%d}", total, active);
            sendJsonResponse(exchange, 200, json);
        }
    }

    // Handler REST API: /api/auth/login (POST)
    static class LoginApiHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String body = readRequestBody(exchange);
            Map<String, String> map = parseJsonSimple(body);
            String u = map.getOrDefault("username", "");
            String p = map.getOrDefault("password", "");

            if ("admin".equals(u) && "admin123".equals(p)) {
                sendJsonResponse(exchange, 200, "{\"success\":true,\"token\":\"auth_token_admin\"}");
            } else {
                sendJsonResponse(exchange, 401, "{\"error\":\"Kata laluan salah!\"}");
            }
        }
    }

    // Helpers
    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }

    private static String readRequestBody(HttpExchange exchange) throws IOException {
        InputStream is = exchange.getRequestBody();
        BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        return sb.toString();
    }

    private static Map<String, String> parseJsonSimple(String json) {
        Map<String, String> map = new HashMap<>();
        if (json == null || json.isEmpty()) return map;
        String clean = json.trim().replaceAll("[{}\"]", "");
        String[] pairs = clean.split(",");
        for (String pair : pairs) {
            String[] kv = pair.split(":", 2);
            if (kv.length == 2) {
                map.put(kv[0].trim(), kv[1].trim());
            }
        }
        return map;
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }

    private static void initDefaultMembersIfEmpty() {
        if (memberList.isEmpty()) {
            memberList.add(new Member("mbr_1", "MBR-000001", "Ahmad bin Zulkifli", "012-3456789", "880101015678", "ahmad@example.com", "SP-0001", "No 12, Jalan Melati 3, 50000 Kuala Lumpur", "2026-09-01T10:00:00", "ACTIVE"));
            memberList.add(new Member("mbr_2", "MBR-000002", "Siti Nurhaliza binti Bakar", "013-9876543", "920202021234", "siti@example.com", "SP-0002", "No 45, Lorong Dahlia, 13700 Perai, Penang", "2026-09-05T14:30:00", "ACTIVE"));
            memberList.add(new Member("mbr_3", "MBR-000003", "Mohd Faiz bin Ibrahim", "017-8899001", "850505089012", "faiz@example.com", "SP-0001", "Lot 203, Kampung Baru, 40000 Shah Alam, Selangor", "2026-09-10T09:15:00", "ACTIVE"));
            idCounter.set(3);
            saveDataToFile();
        }
    }

    private static void saveDataToFile() {
        // Simpan ke fail data tempatan
        try (PrintWriter out = new PrintWriter(new FileWriter(DATA_FILE))) {
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < memberList.size(); i++) {
                sb.append(memberList.get(i).toJson());
                if (i < memberList.size() - 1) sb.append(",");
            }
            sb.append("]");
            out.print(sb.toString());
        } catch (Exception e) {
            System.err.println("Gagal menyimpan data ke fail: " + e.getMessage());
        }
    }

    private static void loadDataFromFile() {
        File f = new File(DATA_FILE);
        if (!f.exists()) return;
        // Inisialisasi counter berdasarkan ID terbesar
        int max = 0;
        for (Member m : memberList) {
            try {
                int num = Integer.parseInt(m.memberId.replaceAll("\\D", ""));
                if (num > max) max = num;
            } catch (Exception ignored) {}
        }
        idCounter.set(max);
    }
}
