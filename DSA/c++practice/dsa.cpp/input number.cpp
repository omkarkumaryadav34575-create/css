#include <iostream>
using namespace std;
int main() {
    int n;
    cin>>n;
    if(n%3==0&&n%5==0){
        cout<<"no"<<endl;
    } else if(n%3==0||n%5==0){
        cout<<"yes"<<endl;
    } else cout<<"invalid"<<endl;
return 0;}