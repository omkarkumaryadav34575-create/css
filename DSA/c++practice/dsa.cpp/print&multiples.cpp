#include <iostream>
using namespace std;
int main() {
    for (int i=1;i<=100;i++){
        if(i%3==0)
        continue;
        
        if (i>80)
        break;
    }
    return 0;
}