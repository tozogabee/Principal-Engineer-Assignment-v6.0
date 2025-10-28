package com.urmine.realtime.ws;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Component
public class TelemetryWebSocketHandler implements WebSocketHandler {

    public Flux<String> stream() {
        return Flux.interval(Duration.ofSeconds(1)).map(t -> "heartbeat:" + t);
    }

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        Flux<WebSocketMessage> out = stream().map(session::textMessage);
        Mono<Void> in = session.receive().map(WebSocketMessage::getPayloadAsText).then();
        return session.send(out).and(in);
    }
}
