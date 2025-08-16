package _th.hackathon.domain.catalog.repository;

import _th.hackathon.domain.catalog.entity.Show;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShowRepository extends JpaRepository<Show, Long> {
}
