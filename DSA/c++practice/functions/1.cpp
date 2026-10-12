#include <iostream>
using namespace std;

long long fact(int n) {
    long long ans = 1;

    for (int i = 1; i <= n; i++)
        ans *= i;

    return ans;
}

long long nCr(int n, int r) {
    long long nFact = fact(n);
    long long rFact = fact(r);
    long long nrFact = fact(n - r);

    return nFact / (rFact * nrFact);
}

int main() {
    int n = 12, r = 2;

    cout << nCr(n, r) << endl;

    return 0;
}