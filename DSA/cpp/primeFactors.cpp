#include <iostream>
using namespace std;

void primeFactors(int n) {
    for (int i = 2; i <= n; i++) {
        while (n % i == 0) {
            cout << i << " ";
            n = n / i;
        }
    }
}

int main() {
    int n;
    cin >> n;

    primeFactors(n);

    return 0;
}