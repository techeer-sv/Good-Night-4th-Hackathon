package hello.hackathonapi.domain.member.repository;

import hello.hackathonapi.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    boolean existsByEmail(String email);
    boolean existsByName(String name);
    Optional<Member> findByEmail(String email);

}