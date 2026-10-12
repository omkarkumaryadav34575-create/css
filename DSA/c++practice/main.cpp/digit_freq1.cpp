#include <iostream>
using namespace std;

int main() {

    long long n;
    cin >> n;

    int digit;

    int count0 = 0;
    int count1 = 0;
    int count2 = 0;
    int count3 = 0;
    int count4 = 0;
    int count5 = 0;
    int count6 = 0;
    int count7 = 0;
    int count8 = 0;
    int count9 = 0;

    // Special case: number itself is 0
    if (n == 0) {
        count0++;
    }
    else {

        while (n > 0) {

            digit = n % 10;

            if (digit == 0) {
                count0++;
            }
            else if (digit == 1) {
                count1++;
            }
            else if (digit == 2) {
                count2++;
            }
            else if (digit == 3) {
                count3++;
            }
            else if (digit == 4) {
                count4++;
            }
            else if (digit == 5) {
                count5++;
            }
            else if (digit == 6) {
                count6++;
            }
            else if (digit == 7) {
                count7++;
            }
            else if (digit == 8) {
                count8++;
            }
            else if (digit == 9) {
                count9++;
            }

            n = n / 10;
        }
    }

    cout << "0 -> " << count0 << endl;
    cout << "1 -> " << count1 << endl;
    cout << "2 -> " << count2 << endl;
    cout << "3 -> " << count3 << endl;
    cout << "4 -> " << count4 << endl;
    cout << "5 -> " << count5 << endl;
    cout << "6 -> " << count6 << endl;
    cout << "7 -> " << count7 << endl;
    cout << "8 -> " << count8 << endl;
    cout << "9 -> " << count9 << endl;

    return 0;
}