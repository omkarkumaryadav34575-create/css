#include <iostream>
using namespace std;
int main () {
    int n;
    cout<<"enter n : "<<endl;
    cin>>n;
    for (int i=0;i<=(n-1);i++){ //outer loop
        for (int j=0;j<=(n-1);j++) { //inner loop 
        cout<<"*"<<" ";
        } 
        cout<<endl;

    } 
    return 0;
}