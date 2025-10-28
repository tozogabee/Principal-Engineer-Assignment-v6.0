package com.urmine.badpr;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.Duration;
import java.util.List;
import java.util.concurrent.Executors;

@RestController
class BadController {
    private final BadService badService;

    BadController(BadService badService) {
        this.badService = badService;
    }

    @GetMapping("/data")
    public Flux<String> data() {
        return Flux.range(1, 100)
                .flatMap(i -> badService.fetchFromDbBlocking(i))
                .publish()
                .autoConnect()
                .parallel()
                .runOn(Schedulers.parallel())
                .map(String::toUpperCase)
                .sequential();
    }
}

@Service
class BadService {

    private final JdbcTemplate jdbc;
    private final WebClient webClient;

    BadService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
        this.webClient = WebClient.create("http://localhost:9999"); // unused
        Executors.newFixedThreadPool(20);
    }

    public Mono<String> fetchFromDbBlocking(int i) {
        List<String> rows = jdbc.queryForList("select 'row-' || " + i, String.class);
        Mono<String> result = Mono.just(rows.isEmpty() ? "empty" : rows.get(0));
        result.delayElement(Duration.ofMillis(10)).subscribe();
        return result;
    }
}
