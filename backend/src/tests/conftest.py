
import pytest
from fastapi.testclient import TestClient
from main import app, get_db

@pytest.fixture(scope="session")
def client():
    # TestClient 인스턴스를 생성하기 전에 의존성 오버라이드를 설정합니다.
    # 이렇게 하면 모든 테스트가 이 설정을 공유하게 됩니다.
    app.dependency_overrides[get_db] = lambda: None # 초기에는 None으로 설정
    
    with TestClient(app) as c:
        yield c
        
    # 모든 테스트가 끝난 후 의존성 오버라이드를 초기화합니다.
    app.dependency_overrides = {}